# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS to allow the React frontend to talk to the backend
origins = [
    "http://192.168.1.231:3028",  # The URL of your React app
    "http://localhost:3028",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
def generate_qr_code(vehicle_number: str):
    """
    Simulates generating a QR code for a given vehicle number.
    Returns a placeholder URL for the photo upload app.
    """
    # In the future, this will generate a real QR code and a unique upload URL
    upload_url = f"https://trucks.approvedwarehouse.com/upload?vehicle={vehicle_number}"
    return {"message": f"QR code for vehicle {vehicle_number} requested.", "upload_url": upload_url}