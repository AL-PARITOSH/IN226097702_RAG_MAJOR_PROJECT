import uvicorn
import os
import sys

# Ensure the root directory is in sys.path
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_path not in sys.path:
    sys.path.insert(0, root_path)

if __name__ == "__main__":
    # Ensure all directories from config exist before starting
    from app.config import settings
    os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    print("Starting FastAPI backend...")
    uvicorn.run("app.api.main:app", host="0.0.0.0", port=8000, reload=True)
