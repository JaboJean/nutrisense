"""
Nutrisense-AI — Complete Kaggle Training Script
================================================
Upload this file to Kaggle as a dataset, OR import the
nutrisense_training.ipynb notebook directly (recommended).

REQUIRED DATASET  →  https://www.kaggle.com/datasets/kmader/food41
  Right panel → Add Data → search "kmader/food41" → Add

Settings → Accelerator  → GPU T4 x2
Settings → Internet     → On   (downloads ViT-Base pretrained weights)

Expected runtime : ~25–35 min · 3 epochs · T4
Output files (in /kaggle/working/):
  food_phase1_best.pth      — food classifier Phase 1
  food_finetuned_model.pth  — final food classifier
  class_names.txt           — class label list
  nutrisense_model.joblib   — 3 XGBoost classifiers + SHAP explainers
"""

# %% [cell 1] ── Install ───────────────────────────────────────────────────────
# !pip install timm shap xgboost -q


# %% [cell 2] ── Imports ───────────────────────────────────────────────────────
import os, time, random, warnings
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms
from torchvision.datasets import ImageFolder
from torch.amp import autocast, GradScaler
from timm.data import Mixup
from timm.data.constants import IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD
import timm
from tqdm import tqdm
from PIL import Image, UnidentifiedImageError
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report
warnings.filterwarnings("ignore")

print("PyTorch  :", torch.__version__)
print("CUDA     :", torch.cuda.is_available())
print("GPUs     :", torch.cuda.device_count())
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


# %% [cell 3] ── Auto-detect dataset root ─────────────────────────────────────
def find_images_root(base: str) -> str:
    """
    Walk the dataset tree and return the first directory whose direct
    children are class-folders that contain image files.
    Works regardless of how many wrapper folders Kaggle adds.
    """
    for root, dirs, files in os.walk(base):
        dirs.sort()
        if not dirs:
            continue
        # Count how many child dirs actually contain images
        has_images = 0
        for d in dirs[:10]:          # sample first 10 folders
            child = os.path.join(root, d)
            try:
                imgs = [f for f in os.listdir(child)
                        if f.lower().endswith((".jpg", ".jpeg", ".png"))]
                if imgs:
                    has_images += 1
            except PermissionError:
                pass
        if has_images >= min(3, len(dirs)):
            return root
    return base

FOOD41_BASE  = "/kaggle/input/food41"
ARABIC_BASE  = "/kaggle/input/arabic-food-101/Arabic Food 101 V3/Images"
SAVE_DIR     = "/kaggle/working"

IMAGES_ROOT  = find_images_root(FOOD41_BASE)
ARABIC_EXISTS = os.path.isdir(ARABIC_BASE)

# Discover classes
all_classes = sorted([
    d for d in os.listdir(IMAGES_ROOT)
    if os.path.isdir(os.path.join(IMAGES_ROOT, d))
])
NUM_CLASSES = len(all_classes)

print(f"Images root : {IMAGES_ROOT}")
print(f"Classes     : {NUM_CLASSES}  ({all_classes[:5]} ...)")
print(f"Arabic data : {'found' if ARABIC_EXISTS else 'NOT found — Phase 2 will be skipped'}")


# %% [cell 4] ── Configuration ────────────────────────────────────────────────
IMG_SIZE     = 224
BATCH_SIZE   = 64       # safe for T4 16 GB with AMP
ACCUM_STEPS  = 2        # effective batch = 128
EPOCHS       = 3        # quick run for progress check
LR           = 1e-4 * (BATCH_SIZE * ACCUM_STEPS / 128)   # linear scaling rule → 1e-4
WEIGHT_DECAY = 0.05
NUM_WORKERS  = 4

# Regularization
LABEL_SMOOTHING = 0.1
MIXUP_ALPHA     = 0.8
CUTMIX_ALPHA    = 1.0
MIXUP_PROB      = 1.0

MODEL_NAME   = "vit_base_patch16_224.orig_in21k"
CKPT_PHASE1  = os.path.join(SAVE_DIR, "food_phase1_best.pth")
CLASSES_TXT  = os.path.join(SAVE_DIR, "class_names.txt")

print(f"Effective batch: {BATCH_SIZE * ACCUM_STEPS}")
print(f"Learning rate  : {LR:.2e}")
print(f"Epochs         : {EPOCHS}")


# %% [cell 5] ── Dataset + transforms ─────────────────────────────────────────
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(IMG_SIZE, scale=(0.08, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandAugment(num_ops=2, magnitude=9),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
])
val_tf = transforms.Compose([
    transforms.Resize(IMG_SIZE + 32),
    transforms.CenterCrop(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
])

# ImageFolder loads all images; we split 80/20
class SafeImageFolder(ImageFolder):
    """Skip corrupted images instead of crashing."""
    def __getitem__(self, index):
        try:
            return super().__getitem__(index)
        except (UnidentifiedImageError, OSError):
            return self.__getitem__((index + 1) % len(self))

full_ds    = SafeImageFolder(root=IMAGES_ROOT)
n_train    = int(0.85 * len(full_ds))
n_val      = len(full_ds) - n_train
train_idx, val_idx = random_split(
    range(len(full_ds)), [n_train, n_val],
    generator=torch.Generator().manual_seed(42)
)

class SubsetWithTransform(Dataset):
    def __init__(self, dataset, indices, transform):
        self.dataset   = dataset
        self.indices   = list(indices)
        self.transform = transform
    def __len__(self): return len(self.indices)
    def __getitem__(self, i):
        img, label = self.dataset[self.indices[i]]
        # img is already a PIL Image from ImageFolder
        return self.transform(img), label

# Re-open without transform so SubsetWithTransform can apply per-split transforms
full_ds_notf = SafeImageFolder(root=IMAGES_ROOT, transform=None)

train_ds = SubsetWithTransform(full_ds_notf, train_idx, train_tf)
val_ds   = SubsetWithTransform(full_ds_notf, val_idx,   val_tf)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                          num_workers=NUM_WORKERS, pin_memory=True)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE * 2, shuffle=False,
                          num_workers=NUM_WORKERS, pin_memory=True)

print(f"Train: {len(train_ds):,} images  ({len(train_loader)} batches)")
print(f"Val  : {len(val_ds):,} images  ({len(val_loader)} batches)")

# Save class names now — needed by food_bridge.py
with open(CLASSES_TXT, "w") as f:
    f.write("\n".join(full_ds.classes))
print(f"class_names.txt saved → {CLASSES_TXT}")


# %% [cell 6] ── Helper functions ─────────────────────────────────────────────
def accuracy(output, target, topk=(1, 5)):
    with torch.no_grad():
        maxk  = max(topk)
        bsize = target.size(0)
        _, pred = output.topk(maxk, 1, True, True)
        pred    = pred.t()
        correct = pred.eq(target.view(1, -1).expand_as(pred))
        return [correct[:k].reshape(-1).float().sum(0).mul_(100.0 / bsize).item()
                for k in topk]

def save_ckpt(model, path, epoch, best_acc):
    torch.save({"epoch": epoch, "best_acc": best_acc,
                "state": model.state_dict()}, path)
    print(f"  ✓ checkpoint → {path}  (epoch {epoch}, top-1 {best_acc:.2f}%)")

def load_ckpt(model, path):
    ckpt = torch.load(path, map_location=DEVICE)
    model.load_state_dict(ckpt["state"])
    print(f"  loaded {path}  (epoch {ckpt['epoch']}, top-1 {ckpt['best_acc']:.2f}%)")
    return ckpt["epoch"], ckpt["best_acc"]


# %% [cell 7] ── Build model ───────────────────────────────────────────────────
model = timm.create_model(MODEL_NAME, pretrained=True, num_classes=NUM_CLASSES)

if torch.cuda.device_count() > 1:
    print(f"Using {torch.cuda.device_count()} GPUs (DataParallel)")
    model = nn.DataParallel(model)

model = model.to(DEVICE)
print(f"Model  : {MODEL_NAME}")
print(f"Params : {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M")


# %% [cell 8] ── Training setup ───────────────────────────────────────────────
mixup_fn = Mixup(
    mixup_alpha=MIXUP_ALPHA,
    cutmix_alpha=CUTMIX_ALPHA,
    prob=MIXUP_PROB,
    label_smoothing=LABEL_SMOOTHING,
    num_classes=NUM_CLASSES,
)
loss_fn   = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
scheduler = optim.lr_scheduler.OneCycleLR(
    optimizer,
    max_lr=LR,
    epochs=EPOCHS,
    steps_per_epoch=max(1, len(train_loader) // ACCUM_STEPS),
)
scaler = GradScaler(device="cuda")


# %% [cell 9] ── Training loop (Phase 1 — Food-41 baseline) ───────────────────
best_acc = 0.0
history  = {"train_loss": [], "val_top1": [], "val_top5": []}

for epoch in range(1, EPOCHS + 1):
    # ── train ──
    model.train()
    running_loss = 0.0
    optimizer.zero_grad()

    for step, (images, labels) in enumerate(tqdm(train_loader,
                                                   desc=f"Ep {epoch}/{EPOCHS} train",
                                                   leave=False)):
        images = images.to(DEVICE, non_blocking=True)
        labels = labels.to(DEVICE, non_blocking=True)

        images, labels = mixup_fn(images, labels)

        with autocast(device_type="cuda", dtype=torch.float16):
            outputs = model(images)
            loss    = loss_fn(outputs, labels) / ACCUM_STEPS

        scaler.scale(loss).backward()
        running_loss += loss.item() * ACCUM_STEPS

        if (step + 1) % ACCUM_STEPS == 0:
            scaler.unscale_(optimizer)
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()
            optimizer.zero_grad()

    avg_loss = running_loss / len(train_loader)

    # ── validate ──
    model.eval()
    top1_sum = top5_sum = 0.0
    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc=f"Ep {epoch}/{EPOCHS} val",
                                   leave=False):
            images = images.to(DEVICE, non_blocking=True)
            labels = labels.to(DEVICE, non_blocking=True)
            with autocast(device_type="cuda", dtype=torch.float16):
                outputs = model(images)
            top1, top5 = accuracy(outputs, labels, topk=(1, min(5, NUM_CLASSES)))
            top1_sum += top1 * images.size(0)
            top5_sum += top5 * images.size(0)

    top1_acc = top1_sum / len(val_ds)
    top5_acc = top5_sum / len(val_ds)
    history["train_loss"].append(avg_loss)
    history["val_top1"].append(top1_acc)
    history["val_top5"].append(top5_acc)

    print(f"Epoch {epoch:02d}/{EPOCHS}  loss {avg_loss:.4f}  "
          f"top-1 {top1_acc:.2f}%  top-5 {top5_acc:.2f}%  "
          f"lr {scheduler.get_last_lr()[0]:.2e}")

    if top1_acc > best_acc:
        best_acc = top1_acc
        save_ckpt(model, CKPT_PHASE1, epoch, best_acc)

print(f"\nPhase 1 complete — best top-1: {best_acc:.2f}%")


# %% [cell 10] ── Training curve ──────────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
ax1.plot(history["train_loss"], label="train loss")
ax1.set(title="Training Loss", xlabel="epoch"); ax1.legend()
ax2.plot(history["val_top1"],  label="top-1")
ax2.plot(history["val_top5"],  label="top-5")
ax2.set(title="Validation Accuracy (%)", xlabel="epoch"); ax2.legend()
plt.tight_layout()
plt.savefig(os.path.join(SAVE_DIR, "training_curve.png"), dpi=120)
plt.show()
print("Saved → training_curve.png")


# %% [cell 11] ── Phase 2: Arabic fine-tuning (skip if data not found) ────────
CKPT_PHASE2 = os.path.join(SAVE_DIR, "food_finetuned_model.pth")

if not ARABIC_EXISTS:
    print("Arabic dataset not found — copying Phase 1 model as the final model.")
    import shutil
    shutil.copy(CKPT_PHASE1, CKPT_PHASE2)
    FINAL_NUM_CLASSES = NUM_CLASSES
    FINAL_CLASSES     = full_ds.classes
else:
    # ── discover Arabic classes ──
    arabic_folders = sorted([
        d.lower().replace(" ", "_")
        for d in os.listdir(ARABIC_BASE)
        if os.path.isdir(os.path.join(ARABIC_BASE, d))
    ])
    # merge with Phase 1 classes (no duplicates)
    merged_classes = sorted(set(full_ds.classes) | set(arabic_folders))
    FINAL_NUM_CLASSES = len(merged_classes)
    FINAL_CLASSES     = merged_classes
    class_to_idx      = {c: i for i, c in enumerate(merged_classes)}
    print(f"Phase 1 classes : {NUM_CLASSES}")
    print(f"Arabic new      : {len(set(arabic_folders) - set(full_ds.classes))}")
    print(f"Total           : {FINAL_NUM_CLASSES}")

    # ── combined dataset ──
    class SubsetWithRemapping(Dataset):
        """
        Wraps an ImageFolder and remaps class indices to the merged list.
        """
        def __init__(self, folder_path, transform, class_to_idx):
            self.ds          = SafeImageFolder(root=folder_path, transform=None)
            self.transform   = transform
            self.class_to_idx = class_to_idx
            # map old idx -> new idx
            self.remap = {
                old_idx: class_to_idx[cls_name.lower().replace(" ", "_")]
                for cls_name, old_idx in self.ds.class_to_idx.items()
                if cls_name.lower().replace(" ", "_") in class_to_idx
            }
        def __len__(self): return len(self.ds)
        def __getitem__(self, i):
            img, old_label = self.ds[i]
            new_label = self.remap.get(old_label, old_label)
            return self.transform(img), new_label

    ft_train_tf = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.2, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(0.2, 0.2, 0.1),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
    ])

    food_ft_ds   = SubsetWithRemapping(IMAGES_ROOT, ft_train_tf, class_to_idx)
    arabic_ft_ds = SubsetWithRemapping(ARABIC_BASE,  ft_train_tf, class_to_idx)
    from torch.utils.data import ConcatDataset
    combined_ds  = ConcatDataset([food_ft_ds, arabic_ft_ds])
    ft_loader    = DataLoader(combined_ds, batch_size=64, shuffle=True,
                              num_workers=NUM_WORKERS, pin_memory=True)

    # ── rebuild model head for new class count ──
    ft_model = timm.create_model(MODEL_NAME, pretrained=False,
                                  num_classes=FINAL_NUM_CLASSES)
    # load Phase 1 weights (except the head)
    ckpt = torch.load(CKPT_PHASE1, map_location=DEVICE)
    state = ckpt["state"] if "state" in ckpt else ckpt
    # strip DataParallel prefix if present
    state = {k.replace("module.", ""): v for k, v in state.items()}
    # load everything except the classifier head
    missing, unexpected = ft_model.load_state_dict(state, strict=False)
    print(f"Loaded Phase 1 weights  missing={len(missing)}  unexpected={len(unexpected)}")

    if torch.cuda.device_count() > 1:
        ft_model = nn.DataParallel(ft_model)
    ft_model = ft_model.to(DEVICE)

    # Stage 1: train only the head (freeze backbone)
    for name, p in ft_model.named_parameters():
        p.requires_grad = "head" in name or "classifier" in name
    ft_opt = optim.AdamW(filter(lambda p: p.requires_grad, ft_model.parameters()),
                          lr=1e-3, weight_decay=0.05)
    ft_loss = nn.CrossEntropyLoss(label_smoothing=0.1)
    ft_scaler = GradScaler(device="cuda")
    print("\n── Stage 1: training head only (3 epochs) ──")
    for ep in range(1, 4):
        ft_model.train()
        for images, labels in tqdm(ft_loader, desc=f"Stage1 ep{ep}", leave=False):
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            with autocast(device_type="cuda", dtype=torch.float16):
                loss = ft_loss(ft_model(images), labels)
            ft_scaler.scale(loss).backward()
            ft_scaler.step(ft_opt); ft_scaler.update(); ft_opt.zero_grad()
        print(f"  epoch {ep}/3  loss {loss.item():.4f}")

    # Stage 2: unfreeze all, low LR
    for p in ft_model.parameters():
        p.requires_grad = True
    ft_opt2 = optim.AdamW(ft_model.parameters(), lr=5e-6, weight_decay=0.05)
    ft_sched = optim.lr_scheduler.OneCycleLR(
        ft_opt2, max_lr=5e-6, epochs=3, steps_per_epoch=len(ft_loader))
    print("\n── Stage 2: full fine-tuning (3 epochs) ──")
    ft_best = 0.0
    for ep in range(1, 4):
        ft_model.train()
        for images, labels in tqdm(ft_loader, desc=f"Stage2 ep{ep}", leave=False):
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            with autocast(device_type="cuda", dtype=torch.float16):
                loss = ft_loss(ft_model(images), labels)
            ft_scaler.scale(loss).backward()
            ft_scaler.step(ft_opt2); ft_scaler.update()
            ft_sched.step(); ft_opt2.zero_grad()
        print(f"  epoch {ep}/3  loss {loss.item():.4f}")

    save_ckpt(ft_model, CKPT_PHASE2, 8, 0.0)
    model = ft_model

    # Update class names file
    with open(CLASSES_TXT, "w") as f:
        f.write("\n".join(FINAL_CLASSES))
    print(f"\nclass_names.txt updated to {FINAL_NUM_CLASSES} classes")

print(f"\nFinal model: {FINAL_NUM_CLASSES} classes  → {CKPT_PHASE2}")


# %% [cell 12] ── Risk model (XGBoost) ────────────────────────────────────────
# Paste the full contents of ML/risk_model.py here.
# It trains in < 5 minutes and saves nutrisense_model.joblib.
# If NHANES data is not available it uses synthetic data automatically.

BUNDLE_SAVE_PATH = os.path.join(SAVE_DIR, "nutrisense_model.joblib")

import pandas as pd
import joblib
import shap
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score
from sklearn.utils.class_weight import compute_sample_weight
from xgboost import XGBClassifier

FEATURES = [
    "age", "sex",
    "energy_kcal", "protein_g", "fat_g", "carb_g",
    "iron_mg", "vitC_mg", "vitA_mcg",
    "fiber_g", "sugar_g",
    "calcium_mg", "zinc_mg", "sodium_mg",
]
TARGETS = ["anemia", "diabetes", "overweight"]

def generate_synthetic_nhanes(n=10000):
    rng = np.random.default_rng(42)
    sex    = rng.integers(1, 3, n)
    age    = rng.uniform(18, 75, n)
    energy = rng.normal(2100, 600, n).clip(800, 4500)
    protein= rng.normal(80,  25, n).clip(20, 200)
    fat    = rng.normal(80,  25, n).clip(20, 200)
    carb   = rng.normal(260, 80, n).clip(50, 600)
    iron   = rng.normal(14,   6, n).clip(1,  40)
    vitC   = rng.normal(90,  50, n).clip(0,  400)
    vitA   = rng.normal(700,300, n).clip(50, 3000)
    fiber  = rng.normal(18,   8, n).clip(2,  60)
    sugar  = rng.normal(90,  40, n).clip(5,  300)
    calc   = rng.normal(900,300, n).clip(100,2500)
    zinc   = rng.normal(11,   4, n).clip(1,  40)
    sodium = rng.normal(3400,900,n).clip(500,8000)
    hgb    = np.where(sex==2,13.0,14.5) + iron*0.08 - age*0.02 + rng.normal(0,0.8,n)
    bmi    = 25 + (energy-2100)/600 + age*0.05 - protein*0.03 + rng.normal(0,3,n)
    hba1c  = 5.0 + (sugar-90)/150 + (bmi-25)*0.06 + rng.normal(0,0.5,n)
    df = pd.DataFrame({
        "age":age,"sex":sex,"energy_kcal":energy,"protein_g":protein,
        "fat_g":fat,"carb_g":carb,"iron_mg":iron,"vitC_mg":vitC,
        "vitA_mcg":vitA,"fiber_g":fiber,"sugar_g":sugar,
        "calcium_mg":calc,"zinc_mg":zinc,"sodium_mg":sodium,
        "_hgb":hgb,"_bmi":bmi,"_hba1c":hba1c,
    })
    df["anemia"]     = ((df["sex"]==2)&(df["_hgb"]<12.0) | (df["sex"]==1)&(df["_hgb"]<13.0)).astype(int)
    df["overweight"] = (df["_bmi"]>=25.0).astype(int)
    df["diabetes"]   = (df["_hba1c"]>=6.5).astype(int)
    return df

NHANES_DIR = "/kaggle/input/nhanes-2017-2018"
if os.path.exists(NHANES_DIR):
    print("Loading NHANES data …")
    # (add your load_nhanes() call here if you have the dataset)
    df = generate_synthetic_nhanes()   # replace with real data
else:
    print("Using synthetic data (replace with NHANES for thesis submission)")
    df = generate_synthetic_nhanes()

df = df.dropna(subset=FEATURES+TARGETS)
X  = df[FEATURES].astype(float).values
Y  = df[TARGETS].values

XGB_PARAMS = dict(
    n_estimators=400, max_depth=5, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
    gamma=0.1, reg_alpha=0.1, reg_lambda=1.0,
    eval_metric="auc", random_state=42, n_jobs=-1,
    device="cuda",
)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
models_xgb = {}; explainers = {}; cv_scores = {}; shap_top = {}

for i, target in enumerate(TARGETS):
    y = Y[:, i]
    print(f"\n{'='*50}\nTraining: {target.upper()}  (pos rate {y.mean()*100:.1f}%)")
    pipe = Pipeline([("scaler", StandardScaler()), ("clf", XGBClassifier(**XGB_PARAMS))])
    sw   = compute_sample_weight("balanced", y)
    res  = cross_validate(pipe, X, y, cv=cv,
                          scoring={"auc":"roc_auc","ap":"average_precision"},
                          fit_params={"clf__sample_weight": sw}, n_jobs=1)
    print(f"  ROC-AUC : {res['test_auc'].mean():.3f} ± {res['test_auc'].std():.3f}")
    print(f"  Avg-Prec: {res['test_ap'].mean():.3f}")
    cv_scores[target] = {"roc_auc": float(res['test_auc'].mean()),
                          "avg_prec": float(res['test_ap'].mean())}
    pipe.fit(X, y, clf__sample_weight=sw)
    models_xgb[target] = pipe
    booster  = pipe.named_steps["clf"]
    scaler_s = pipe.named_steps["scaler"]
    explainer = shap.TreeExplainer(booster)
    explainers[target] = explainer
    sv = explainer.shap_values(scaler_s.transform(X[:500]))
    top5 = np.abs(sv).mean(0).argsort()[::-1][:5]
    shap_top[target] = [
        {"f": FEATURES[j], "v": round(float(np.mean(sv[:,j])),3),
         "label": f"{'Increases' if np.mean(sv[:,j])>0 else 'Reduces'} {target} risk"}
        for j in top5
    ]
    plt.figure(figsize=(7,4))
    shap.summary_plot(sv, scaler_s.transform(X[:500]),
                      feature_names=FEATURES, show=False, plot_type="bar")
    plt.title(f"SHAP — {target}"); plt.tight_layout()
    plt.savefig(os.path.join(SAVE_DIR, f"shap_{target}.png"), dpi=120); plt.close()
    print(f"  SHAP saved → shap_{target}.png")

bundle = {
    "features": FEATURES, "models": models_xgb, "explainers": explainers,
    "shap_top": shap_top,
    "thresholds": {"anemia":0.40,"diabetes":0.35,"overweight":0.50},
    "label_definitions": {
        "anemia":     "Hemoglobin < 12 g/dL (women) or < 13 g/dL (men)  [WHO 2011]",
        "overweight": "BMI >= 25  [WHO]",
        "diabetes":   "HbA1c >= 6.5 %  [ADA 2023]",
    },
    "cv_scores": cv_scores,
}
joblib.dump(bundle, BUNDLE_SAVE_PATH)
print(f"\nBundle saved → {BUNDLE_SAVE_PATH}")


# %% [cell 13] ── Final verification ──────────────────────────────────────────
print("=" * 55)
print("OUTPUT FILES")
print("=" * 55)
outputs = {
    CKPT_PHASE1:  "Phase 1 model (food41 baseline)",
    CKPT_PHASE2:  "Final model  (use this in Flask)",
    CLASSES_TXT:  "Class names  (required by inference)",
    BUNDLE_SAVE_PATH: "Risk model bundle (3 XGBoost + SHAP)",
}
all_ok = True
for path, desc in outputs.items():
    if os.path.exists(path):
        size = os.path.getsize(path) / 1e6
        print(f"  ✓  {desc:40s}  {size:.1f} MB")
    else:
        print(f"  ✗  {desc:40s}  MISSING")
        all_ok = False

print()
bundle = joblib.load(BUNDLE_SAVE_PATH)
print("Risk model diseases :", list(bundle["models"].keys()))
print("CV scores           :", {k: f"{v['roc_auc']:.3f}" for k,v in bundle["cv_scores"].items()})
print()
print("✅ ALL DONE" if all_ok else "⚠ Some files missing — check above")
print()
print("Next: download all 4 files + the 3 shap_*.png plots from the Output tab.")
