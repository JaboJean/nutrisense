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

MODEL_DIR = Path(os.getenv("MODEL_DIR", Path(__file__).parent / "models"))
MODEL_PATH = MODEL_DIR / "food_finetuned_model.pth"
CLASSES_PATH = MODEL_DIR / "class_names.txt"

_TRANSFORM = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
])


class FoodPredictor:
    def __init__(self) -> None:
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        with open(CLASSES_PATH) as f:
            self.classes = [l.strip() for l in f if l.strip()]

        ckpt = torch.load(MODEL_PATH, map_location=self.device, weights_only=False)
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
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = _TRANSFORM(img).unsqueeze(0).to(self.device)
        logits = self.model(tensor)
        probs  = F.softmax(logits, dim=1)[0]
        idx    = int(probs.argmax())
        return self.classes[idx], float(probs[idx])
