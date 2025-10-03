# FastAPI Backend Dockerfile
FROM python:3.11-slim
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
# Set the working directory in the container
WORKDIR /app
# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of the application code
COPY . /app/
# Expose the port the application runs on (Uvicorn default)
EXPOSE 8000 
# Command to run the application using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]