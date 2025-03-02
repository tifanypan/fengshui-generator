# # run.py
# import uvicorn
# from app.database.models import create_tables

# if __name__ == "__main__":
#     # Create database tables
#     create_tables()
    
#     # Run the server
#     uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

    

import uvicorn
import os
import sys
from pathlib import Path

# Add the project root to the Python path to ensure proper module imports
project_root = str(Path(__file__).resolve().parent)
sys.path.insert(0, project_root)

# Initialize database if needed
from app.database.models import create_tables
create_tables()

# Run the application with uvicorn
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )