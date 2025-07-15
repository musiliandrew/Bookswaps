#!/bin/bash

echo "🔄 Restarting Bookswaps services..."

# Determine which docker-compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🏭 Using production configuration"
else
    echo "🛠️  Using development configuration"
fi

# Stop all services
echo "⏹️  Stopping all services..."
docker-compose -f $COMPOSE_FILE down

# Remove any orphaned containers
echo "🧹 Cleaning up..."
docker-compose -f $COMPOSE_FILE rm -f

# Start MinIO first
echo "🗄️  Starting MinIO..."
docker-compose -f $COMPOSE_FILE up -d minio

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 10

# Start database and Redis
echo "🗃️  Starting database and Redis..."
docker-compose -f $COMPOSE_FILE up -d db redis

# Wait a bit for database
echo "⏳ Waiting for database..."
sleep 5

# Start backend
echo "🔧 Starting backend..."
docker-compose -f $COMPOSE_FILE up -d backend

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Start frontend
echo "🎨 Starting frontend..."
docker-compose -f $COMPOSE_FILE up -d frontend

# Show status
echo "📊 Service status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "🎉 Services restarted!"
echo ""
if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
    echo "📍 Production access points:"
    echo "   Website: https://bookswaps.co.ke"
    echo "   Admin: https://bookswaps.co.ke/admin"
    echo "   Note: System nginx handles SSL termination"
else
    echo "📍 Development access points:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    echo "   MinIO Console: http://localhost:9001"
fi
echo ""
echo "📋 View logs:"
echo "   docker-compose -f $COMPOSE_FILE logs -f backend"
echo "   docker-compose -f $COMPOSE_FILE logs -f frontend"
echo ""
echo "💡 Usage: ./restart_services.sh [prod|production] for production mode"
