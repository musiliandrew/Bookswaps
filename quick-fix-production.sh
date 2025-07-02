#!/bin/bash

# Quick fix for production MIME type errors
# This script fixes the immediate deployment issue

echo "🔧 Applying quick fix for production deployment..."

# Stop current containers
echo "Stopping current containers..."
docker-compose down

# Remove existing containers and images
echo "Cleaning up..."
docker-compose -f docker-compose.yml down --rmi all --volumes --remove-orphans || true

# Use production configuration
echo "Starting production deployment..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Quick fix applied! Your application should now work properly."
echo "Check the status with: docker-compose -f docker-compose.prod.yml ps"
echo "View logs with: docker-compose -f docker-compose.prod.yml logs -f"
