1. Use an official Python runtime as a parent image

FROM python:3.11-slim

2. Set the working directory in the container

WORKDIR /app

3. Copy the requirements file first to leverage Docker cache

COPY requirements.txt requirements.txt

4. Install any needed packages specified in requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

5. Copy the rest of the application code into the container

COPY . .

6. Make port 8000 available to the world outside this container

EXPOSE 8000

7. Define the command to run your app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]