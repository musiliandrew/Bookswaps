# backend/Dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the entire backend folder into the container
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Start the application using Gunicorn
CMD ["gunicorn", "wsgi:application", "--bind", "0.0.0.0:8000"]
