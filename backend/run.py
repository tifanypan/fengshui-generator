# run.py
import uvicorn
from app.database.models import create_tables

if __name__ == "__main__":
    # Create database tables
    create_tables()
    
    # Run the server
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)