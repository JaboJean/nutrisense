"""
ViT food classifier — loads food_finetuned_model.pth once at startup,
exposes classify(image_bytes) -> (class_name, confidence).
"""
import io
import os
from pathlib import Path

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from timm.data.constants import IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD
import timm

MODEL_DIR    = Path(os.getenv("MODEL_DIR", Path(__file__).parent)) / "models"
MODEL_PATH   = MODEL_DIR / "food_finetuned_model.pth"
CLASSES_PATH = MODEL_DIR / "class_names.txt"
HF_SPACE_REPO = "JeanJabo/nutrisense-api"

_TRANSFORM = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
])


def _ensure_model() -> None:
    """Download model weights from the models/ subfolder of the Space on first startup."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        return
    from huggingface_hub import hf_hub_download
    for filename in ("food_finetuned_model.pth", "class_names.txt"):
        dest = MODEL_DIR / filename
        if dest.exists():
            continue
        print(f"Downloading models/{filename} from {HF_SPACE_REPO} ...")
        hf_hub_download(
            repo_id=HF_SPACE_REPO,
            repo_type="space",
            filename=f"models/{filename}",
            local_dir=str(MODEL_DIR),
            local_dir_use_symlinks=False,
        )
    print("Download complete.")


class FoodPredictor:
    def __init__(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        if CLASSES_PATH.exists():
            with open(CLASSES_PATH) as f:
                self.classes = [line.strip() for line in f if line.strip()]
        else:
            self.classes = [
                "bhaji", "chapati", "githeri", "kachumbari", "kukuchoma",
                "mandazi", "masalachips", "matoke", "mukimo", "nyamachoma",
                "pilau", "sukumawiki", "ugali",
            ]

        _ensure_model()

        ckpt  = torch.load(MODEL_PATH, map_location=self.device, weights_only=False)
        state = ckpt.get("state", ckpt)
        state = {k.replace("module.", ""): v for k, v in state.items()}

        self.model = timm.create_model(
            "vit_base_patch16_224.orig_in21k",
            pretrained=False,
            num_classes=len(self.classes),
        )
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

    @torch.inference_mode()
    def classify(self, image_bytes: bytes) -> tuple[str, float]:
        img    = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = _TRANSFORM(img).unsqueeze(0).to(self.device)
        logits = self.model(tensor)
        probs  = F.softmax(logits, dim=1)[0]
        idx    = int(probs.argmax())
        return self.classes[idx], float(probs[idx])
