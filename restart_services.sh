#!/bin/bash

echo "🔄 Restarting Bookswaps services with MinIO fixes..."

# Stop all services
echo "⏹️  Stopping all services..."
docker-compose down

# Remove any orphaned containers
echo "🧹 Cleaning up..."
docker-compose rm -f

# Start MinIO first
echo "🗄️  Starting MinIO..."
docker-compose up -d minio

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 10

# Check if MinIO is accessible
echo "🔍 Testing MinIO connectivity..."
curl -f http://localhost:9000/minio/health/live || echo "⚠️  MinIO health check failed, but continuing..."

# Start database and Redis
echo "🗃️  Starting database and Redis..."
docker-compose up -d db redis

# Wait a bit for database
echo "⏳ Waiting for database..."
sleep 5

# Start backend
echo "🔧 Starting backend..."
docker-compose up -d backend

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Start frontend
echo "🎨 Starting frontend..."
docker-compose up -d frontend

# Show status
echo "📊 Service status:"
docker-compose ps

echo ""
echo "🎉 Services restarted!"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   MinIO Console: http://localhost:9001 (admin/minioadmin)"
echo ""
echo "🧪 Test MinIO connection:"
echo "   docker-compose exec backend python manage.py test_minio"
echo ""
echo "📋 View logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f minio"
