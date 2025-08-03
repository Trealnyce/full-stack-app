from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI app
app = FastAPI()

# Configure CORS
# This is crucial for allowing the React frontend (running on a different port)
# to communicate with this backend.
origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the root endpoint
@app.get("/")
def read_root():
    """
    Returns a simple JSON message.
    """
    return {"message": "Hello from the FastAPI backend!"}
