#!/bin/bash

# Book Swap App Sharing Script
# This script helps you share your app with other users

echo "🚀 Book Swap App Sharing Setup"
echo "================================"

# Get the machine's IP address
IP=$(hostname -I | awk '{print $1}')
echo "📍 Your machine's IP address: $IP"

# Update .env file with the current IP
echo "🔧 Updating .env file with your IP address..."

# Backup original .env
cp .env .env.backup

# Update .env file
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$IP:5173|g" .env
sed -i "s|MINIO_ENDPOINT_URL=.*|MINIO_ENDPOINT_URL=http://$IP:9000|g" .env
sed -i "s|VITE_WS_URL=.*|VITE_WS_URL=ws://$IP:8000|g" .env
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://$IP:8000/api/|g" .env

echo "✅ Environment file updated!"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🐳 Starting Docker containers..."
docker compose down
docker compose up --build -d

echo ""
echo "🎉 Your Book Swap app is now accessible!"
echo "================================"
echo "📱 Frontend (Main App): http://$IP:5173"
echo "🔧 Backend API: http://$IP:8000/api/"
echo "📁 MinIO Console: http://$IP:9001"
echo ""
echo "📋 Share this URL with other users: http://$IP:5173"
echo ""
echo "⚠️  Make sure:"
echo "   - Both devices are on the same network (WiFi/LAN)"
echo "   - Firewall allows connections on ports 5173 and 8000"
echo ""
echo "🔍 To check logs: docker compose logs -f"
echo "🛑 To stop: docker compose down"
