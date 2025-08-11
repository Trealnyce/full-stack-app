# main.py
import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

# Define a Pydantic model to receive the JSON data from the frontend
class VehicleNumberRequest(BaseModel):
    vehicle_number: str

app = FastAPI()

# Configure CORS to allow the React frontend to talk to the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allowing all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A simple "Hello, World!" endpoint at the root URL
@app.get("/")
def read_root():
    """
    Returns a simple welcome message for the API.
    """
    return {"message": "Vehicle Photo Uploader API is Running!"}

# Endpoint to simulate QR code generation
@app.post("/qr_code")
def generate_qr_code(request: VehicleNumberRequest):
    """
    Simulates generating a QR code for a given vehicle number.
    Returns the correct URL for the photo upload app.
    """
    vehicle_number = request.vehicle_number
    # CORRECTED: This URL now points directly to your React app's local address and port
    upload_url = f"http://192.168.1.231:3028?vehicle={vehicle_number}"
    return {"message": f"QR code for vehicle {vehicle_number} requested.", "upload_url": upload_url}

# New endpoint to handle file uploads
@app.post("/upload_photo")
async def upload_photo(vehicle_number: str, file: UploadFile = File(...)):
    """
    Receives an image file and saves it to the server.
    """
    try:
        # Create a unique filename using the vehicle number and a timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{vehicle_number}_{timestamp}.{file.filename.split('.')[-1]}"
        
        # Define the path to save the file
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)

        # Save the file to the server
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"message": f"Photo for vehicle {vehicle_number} uploaded successfully!", "filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {e}")
