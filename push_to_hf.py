"""Run with the venv Python to push updated API files to HuggingFace Space."""
import getpass
from huggingface_hub import HfApi, login

token = getpass.getpass("HuggingFace token (input hidden): ")
login(token=token, add_to_git_credential=False)
api = HfApi()

files = [
    ("api/food_predictor.py", "food_predictor.py"),
    ("api/risk_predictor.py", "risk_predictor.py"),
    ("api/class_names.txt",   "class_names.txt"),
]

for local, remote in files:
    print(f"Pushing {remote} ...", end=" ", flush=True)
    api.upload_file(
        path_or_fileobj=local,
        path_in_repo=remote,
        repo_id="JeanJabo/nutrisense-api",
        repo_type="space",
        token=token,
    )
    print("done")

print("\nAll files pushed. Space will rebuild in ~1 minute.")
print("Watch: https://huggingface.co/spaces/JeanJabo/nutrisense-api")
