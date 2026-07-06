"""
Push updated API files to the HuggingFace Space.
Usage:  python push_to_hf.py --token hf_YOUR_TOKEN_HERE
"""
import argparse
from huggingface_hub import HfApi

SPACE_ID = "JeanJabo/nutrisense-api"
FILES = [
    ("api/risk_predictor.py", "risk_predictor.py"),
    ("api/nutrition_db.py",   "nutrition_db.py"),
    ("api/food_predictor.py", "food_predictor.py"),
    ("api/requirements.txt",  "requirements.txt"),
]

parser = argparse.ArgumentParser()
parser.add_argument("--token", required=True, help="HuggingFace write token")
args = parser.parse_args()

api = HfApi(token=args.token)
for local, remote in FILES:
    print(f"Uploading {remote} ...", end=" ", flush=True)
    api.upload_file(
        path_or_fileobj=local,
        path_in_repo=remote,
        repo_id=SPACE_ID,
        repo_type="space",
    )
    print("done")

print(f"\nSpace rebuilding → https://huggingface.co/spaces/{SPACE_ID}")
