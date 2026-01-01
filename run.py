import uvicorn
import sys
import os

if __name__ == "__main__":
    # Add the project root to the Python path to allow for absolute imports
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, project_root)
    
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
