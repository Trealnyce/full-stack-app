# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Define a Pydantic model to receive the JSON data from the frontend
class VehicleNumberRequest(BaseModel):
    vehicle_number: str

app = FastAPI()

# Configure CORS to allow the React frontend to talk to the backend.
# The `allow_origins=["*"]` setting allows requests from any origin,
# which is necessary for internal container-to-container communication in Docker.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allowing all origins to fix the communication issue
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

# New endpoint to simulate QR code generation
@app.post("/qr_code")
def generate_qr_code(request: VehicleNumberRequest):
    """
    Simulates generating a QR code for a given vehicle number.
    Returns a placeholder URL for the photo upload app.
    """
    # In the future, this will generate a real QR code and a unique upload URL
    vehicle_number = request.vehicle_number
    upload_url = f"https://trucks.approvedwarehouse.com/upload?vehicle={vehicle_number}"
    return {"message": f"QR code for vehicle {vehicle_number} requested.", "upload_url": upload_url}
