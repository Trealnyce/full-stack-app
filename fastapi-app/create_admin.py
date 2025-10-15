import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import User, get_password_hash # Import your existing User model and hashing function

# --- IMPORTANT: Configure Your Admin User Here ---
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "YourSecurePassword123" # <--- CHANGE THIS to a strong password
# --------------------------------------------------

print("--- Admin User Creation Script ---")

# Load database URL from environment variables, just like in the main app
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is not set.")
    exit()

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    print("Successfully connected to the database.")
except Exception as e:
    print(f"ERROR: Could not connect to the database: {e}")
    exit()

# Check if the user already exists
existing_user = db.query(User).filter(User.username == ADMIN_USERNAME).first()
if existing_user:
    print(f"User '{ADMIN_USERNAME}' already exists. Exiting.")
else:
    # Create the new admin user
    hashed_password = get_password_hash(ADMIN_PASSWORD)
    new_user = User(username=ADMIN_USERNAME, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    print(f"Successfully created admin user: '{ADMIN_USERNAME}'")

db.close()
print("------------------------------------")
