"""
NutriVision AI — Unified Training Configuration
================================================
Paste this as the SINGLE config cell at the top of your Kaggle notebook.
It replaces the 8 separate config blocks scattered across cells 16, 30, 39, 50, 60.

Set PHASE before running the training cells.
"""

import os
import torch

# ── Environment detection ──────────────────────────────────────────────────────
IS_COLAB  = os.path.exists("/content")
IS_KAGGLE = os.path.exists("/kaggle")

if IS_COLAB:
    BASE_DIR_101  = "/content/drive/MyDrive/Dataset"
    ARABIC_DIR    = "/content/drive/MyDrive/arabic-food-101/Images"
    SAVE_DIR      = "/content/drive/MyDrive/checkpoints"
elif IS_KAGGLE:
    BASE_DIR_101  = "/kaggle/input/food-101/food-101"
    ARABIC_DIR    = "/kaggle/input/arabic-food-101/Arabic Food 101 V3/Images"
    SAVE_DIR      = "/kaggle/working"
else:
    # Local testing
    BASE_DIR_101  = "./data/food-101"
    ARABIC_DIR    = "./data/arabic-food-101"
    SAVE_DIR      = "./checkpoints"

os.makedirs(SAVE_DIR, exist_ok=True)

# ── Hardware ───────────────────────────────────────────────────────────────────
DEVICE     = "cuda" if torch.cuda.is_available() else "cpu"
NUM_GPUS   = torch.cuda.device_count()
NUM_WORKERS = min(4, os.cpu_count() or 2)

# Batch size per GPU + gradient accumulation to simulate a larger effective batch.
# Effective batch = BATCH_SIZE * ACCUM_STEPS
#   T4  16 GB  → BATCH_SIZE=64,  ACCUM_STEPS=2  (effective 128)
#   P100 16 GB → BATCH_SIZE=96,  ACCUM_STEPS=1  (effective 96)
#   A100 40 GB → BATCH_SIZE=128, ACCUM_STEPS=1  (effective 128)
BATCH_SIZE  = 64     # safe default for T4; increase if you have more VRAM
ACCUM_STEPS = 2      # gradient accumulation steps

print(f"Device : {DEVICE}  ({NUM_GPUS} GPU(s))")
print(f"Workers: {NUM_WORKERS}")
print(f"Effective batch: {BATCH_SIZE * ACCUM_STEPS}")

# ── Image config ───────────────────────────────────────────────────────────────
IMG_SIZE = 224

# ── Phase 1 — Food-101 training (ViT-Base) ─────────────────────────────────────
# Original notebook used 30 epochs. 15 is sufficient with OneCycleLR
# and saves ~1.5 hours of GPU time on Kaggle.
V1_MODEL_NAME    = "vit_base_patch16_224.orig_in21k"
V1_NUM_CLASSES   = 101
V1_EPOCHS        = 15      # was 30 — saves ~2 hrs on T4
V1_LR            = 3e-4    # scaled for effective batch 128
V1_WEIGHT_DECAY  = 0.05
V1_LABEL_SMOOTH  = 0.1
V1_MIXUP_ALPHA   = 0.8
V1_CUTMIX_ALPHA  = 1.0
V1_CHECKPOINT    = os.path.join(SAVE_DIR, "food101_best_model.pth")

# ── Phase 2 — Arabic fine-tuning (extend to 119 classes) ──────────────────────
# Load V1 checkpoint, add 18 new Arabic class heads, fine-tune for 8 epochs.
V2_NUM_CLASSES   = 119     # 101 Food-101 + 18 Arabic
V2_EPOCHS        = 8       # was not specified — 8 is enough for transfer learning
V2_LR            = 5e-6    # much smaller LR for fine-tuning
V2_CHECKPOINT    = os.path.join(SAVE_DIR, "food_finetuned_model.pth")
CLASSES_TXT      = os.path.join(SAVE_DIR, "class_names.txt")  # must save 119 names

# ── Phase 3 — V2 improvements (focal loss + RandAugment) ──────────────────────
V3_EPOCHS        = 10
V3_LR            = 1e-6
V3_CHECKPOINT    = os.path.join(SAVE_DIR, "food_V2_model.pth")

# ── Phase 4 — ConvNeXt-Base (V3 in notebook) ─────────────────────────────────
# ConvNeXt converges in fewer epochs than ViT on fine-grained data.
V4_MODEL_NAME    = "convnext_base.fb_in22k"
V4_NUM_CLASSES   = 119
V4_EPOCHS        = 10
V4_LR            = 3e-4
V4_CHECKPOINT    = os.path.join(SAVE_DIR, "food_V3_model.pth")

# ── SOTA regularisation (shared) ──────────────────────────────────────────────
MIXUP_PROB       = 1.0

# ── Checkpoint helper ─────────────────────────────────────────────────────────
def save_checkpoint(model, path: str, epoch: int, best_acc: float):
    torch.save({
        "epoch":    epoch,
        "best_acc": best_acc,
        "state":    model.state_dict(),
    }, path)
    print(f"  checkpoint saved → {path}  (epoch {epoch}, acc {best_acc:.2f}%)")

def load_checkpoint(model, path: str):
    ckpt = torch.load(path, map_location=DEVICE)
    model.load_state_dict(ckpt["state"])
    print(f"  loaded {path}  (epoch {ckpt['epoch']}, acc {ckpt['best_acc']:.2f}%)")
    return ckpt["epoch"], ckpt["best_acc"]

print("\nConfiguration ready.")
