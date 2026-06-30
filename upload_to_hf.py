"""
Run this once to upload the entire api/ folder (including model files) to HuggingFace Spaces.
Usage:  python upload_to_hf.py
"""
import sys
from huggingface_hub import login, upload_folder

TOKEN = input("Paste your HuggingFace write token (hf_...): ").strip()
login(token=TOKEN)

print("\nUploading api/ folder to JeanJabo/nutrisense-api ...")
print("This may take a few minutes for the model files (~335 MB).\n")

upload_folder(
    folder_path="api",
    repo_id="JeanJabo/nutrisense-api",
    repo_type="space",
    ignore_patterns=[".gitkeep"],
    commit_message="feat: add FastAPI backend with ML models",
)

print("\nDone! Your Space URL is:")
print("https://huggingface.co/spaces/JeanJabo/nutrisense-api")
print("\nIt will take 2-5 minutes to build. Watch the build log in the App tab.")
