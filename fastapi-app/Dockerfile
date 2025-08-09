# Dockerfile for FastAPI app

# Use a Python base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file and install the dependencies
COPY ./requirements.txt /code/requirements.txt

# Install the required Python packages
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the application code
COPY ./ /code/

# Expose the port that Uvicorn will run on
EXPOSE 8000