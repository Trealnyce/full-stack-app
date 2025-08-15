# main.py
import os
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import JSONResponse

# Initialize the FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from the React frontend
origins = [
    "https://qrcode.molyneaux.xyz",
    "https://vehicledamage.molyneaux.xyz",
    "https://api.molyneaux.xyz" # Add the new API domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a Pydantic model for the QR code request body
class QRCodeRequest(BaseModel):
    upload_url: str

# Define the directory where uploads will be stored
UPLOAD_DIR = "uploads"
# Create the uploads directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Endpoint to generate a QR code link.
@app.post("/qr_code")
async def generate_qr_code(request: QRCodeRequest):
    return {"upload_url": request.upload_url}


# Endpoint to handle multiple photo uploads
@app.post("/upload_photos")
async def upload_photos(
    vehicle_number: str,
    files: List[UploadFile] = File(...),
):
    # Check if a vehicle number was provided
    if not vehicle_number:
        raise HTTPException(status_code=400, detail="Vehicle number not provided.")
    
    # Define the vehicle's specific upload directory
    vehicle_dir = os.path.join(UPLOAD_DIR, vehicle_number)
    # Create the vehicle-specific directory if it doesn't exist
    os.makedirs(vehicle_dir, exist_ok=True)

    # Process and save each file in the list
    saved_files = []
    for file in files:
        try:
            # Create a file path with the original filename
            file_path = os.path.join(vehicle_dir, file.filename)
            
            # Use a context manager to handle the file in chunks
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Add the saved file to our list for the response
            saved_files.append(file.filename)
        except Exception as e:
            # If there's an error, raise an HTTPException
            raise HTTPException(status_code=500, detail=f"Failed to save file {file.filename}: {e}")
        finally:
            # Ensure the file is closed even if an error occurs
            file.file.close()

    # Return a success message with the list of uploaded filenames
    return JSONResponse(content={
        "message": f"Successfully uploaded {len(saved_files)} photos for vehicle {vehicle_number}.",
        "filenames": saved_files
    })

# Root endpoint for a simple health check
@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI Vehicle Photo Uploader API!"}
