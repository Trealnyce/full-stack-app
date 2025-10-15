version: '3.0'

services:
  # 1. QR Code Frontend
  qrcode-app:
    image: trealnyce/qrcode-app:latest
    container_name: qrcode-app
    networks:
      - trealnyce_app_network
    depends_on:
      - fastapi-backend
  
  # 2. Application Backend Service (FastAPI)
  fastapi-backend:
    # Build from context, now that we know the path is fixed
    build:
      context: ./fastapi-app 
      dockerfile: Dockerfile
    container_name: fastapi-backend
    environment:
      POSTGRES_USER: trealnyce
      POSTGRES_PASSWORD: Approved110$$
      POSTGRES_DB: photo_db
      DATABASE_URL: postgresql://trealnyce:Approved110$$@postgres-db:5432/photo_db
      API_KEY: '@It31c8My^a%b$v!' 
      NFS_MOUNT_PATH: /app/uploads
    # Temporarily remove NFS volume mount
    # volumes:
    #   - photo-storage:/app/uploads 
    networks:
      - trealnyce_app_network
      - internal-network
    depends_on:
      - database
    restart: unless-stopped

  # 3. Database Service (Postgres)
  database:
    image: postgres:13
    container_name: postgres-db
    restart: always
    environment:
      POSTGRES_USER: trealnyce
      POSTGRES_PASSWORD: Approved110$$
      POSTGRES_DB: photo_db
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - internal-network

networks:
  trealnyce_app_network:
    external: true
  internal-network:
    internal: true

volumes:
  db-data:
    driver: local
  # Temporarily remove photo-storage volume definition
