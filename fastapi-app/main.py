import os
import qrcode
import logging
from io import BytesIO
from datetime import datetime, timedelta
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- Configuration and Environment Variables ---
# Load environment variables from .env file (kept, but DB URL is hardcoded)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not found, assuming environment variables are set.")

# --- Database Setup (HARDCODED CONNECTION STRING) ---
# This bypasses potential environment variable reading issues.
# It MUST match the POSTGRES_PASSWORD in your docker-compose.yml (Approved110$$)
DATABASE_URL = "postgresql://trealnyce:Approved110$$@postgres-db:5432/photo_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- NEW: Logging Setup ---
logging.basicConfig(level=logging.INFO)

# --- NEW: File Storage Configuration ---
PHOTO_STORAGE_PATH = "/volume1/approved/photos/trucks"
if not os.path.isdir(PHOTO_STORAGE_PATH):
    logging.warning(f"Photo storage path does not exist: {PHOTO_STORAGE_PATH}. Ensure the volume is mounted correctly.")


# --- Database Model ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Fix for ValueError: password cannot be longer than 72 bytes
    truncated_password = password.encode('utf-8')[:72]
    return pwd_context.hash(truncated_password)


# --- ADMIN USER SEEDING LOGIC (Runs on Startup) ---
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Approved123" # <--- LOGIN PASSWORD!

def initialize_admin_user(db: Session):
    """Checks for the admin user and creates it if missing."""
    try:
        # Check if the database connection is available
        db.connection() 
    except Exception as e:
        logging.error(f"FATAL: Database connection failed during startup check. Error: {e}")
        return

    existing_user = db.query(User).filter(User.username == ADMIN_USERNAME).first()

    if not existing_user:
        hashed_password = get_password_hash(ADMIN_PASSWORD)
        new_user = User(username=ADMIN_USERNAME, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        logging.info(f"SUCCESS: Default admin user '{ADMIN_USERNAME}' created.")
    # No need for an 'else', we log the success/skip and exit.

# --- Application Startup Sequence ---

# Create the database table
# This must run before the application starts listening
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logging.error(f"CRITICAL ERROR: Failed to create database tables. Check postgres container logs. {e}")
    # Application will crash here if DB is unreachable or authentication fails.

# Initialize the admin user immediately after tables are ready
initialize_admin_user(SessionLocal()) 

# --- FastAPI Application ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://qrcode.molyneaux.xyz"], # Allow your frontend
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# OAuth2 for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get the current user from the token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---

@app.post("/register")
def register_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Registers a new user in the database. (Used for non-admin users)
    """
    existing_user = db.query(User).filter(User.username == form_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(form_data.password)
    new_user = User(username=form_data.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Handles user login and returns an access token upon successful authentication.
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/generate-qr-code", response_class=Response)
def generate_qr_code(
    current_user: User = Depends(get_current_user)
):
    """
    Generates a QR code for a logged-in user.
    """
    qr_content = f"Logged in user: {current_user.username}"
    
    img = qrcode.make(qr_content)
    buf = BytesIO()
    img.save(buf)
    return Response(content=buf.getvalue(), media_type="image/png")


# --- NEW: Photo Upload Endpoint ---
@app.post("/upload/photo/")
async def upload_vehicle_photo(
    vehicle_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Receives a photo and metadata from an authenticated user.
    """
    logging.info(f"User '{current_user.username}' initiated photo upload for vehicle: {vehicle_id}")

    # 1. Create the vehicle-specific folder path
    vehicle_folder_path = os.path.join(PHOTO_STORAGE_PATH, vehicle_id)
    
    try:
        # 2. Create the directory if it doesn't already exist
        os.makedirs(vehicle_folder_path, exist_ok=True)
        logging.info(f"Ensured directory exists: {vehicle_folder_path}")
    except OSError as e:
        logging.error(f"Error creating directory {vehicle_folder_path}: {e}")
        raise HTTPException(status_code=500, detail="Could not create storage directory on server.")

    # 3. Create a unique, descriptive filename
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".jpg"
    filename = f"{timestamp}_lat{latitude}_lon{longitude}{file_extension}"
    file_location = os.path.join(vehicle_folder_path, filename)

    # 4. Save the file to the NAS
    try:
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())
        logging.info(f"Successfully saved file to: {file_location}")
    except Exception as e:
        logging.error(f"Error saving file '{file_location}': {e}")
        raise HTTPException(status_code=500, detail="An error occurred while saving the file.")

    # 5. Return a success response
    return {
        "message": f"Successfully uploaded {filename} for vehicle {vehicle_id}.",
        "uploader": current_user.username,
        "stored_path": file_location
    }
