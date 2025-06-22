FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt /app/backend/
RUN apt-get update && \
    apt-get install -y --no-install-recommends netcat-openbsd && \
    pip install --upgrade pip && \
    pip install --retries 10 --timeout 60 -r backend/requirements.txt && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the entire project root into the container
COPY . /app/

EXPOSE 8000