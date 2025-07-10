#!/bin/bash
set -e

echo "🚀 Starting auto-deployment from GitHub..."

# Navigate to project directory
cd /opt/bookswaps

# Pull latest changes
git pull origin main

# Create .env from environment variable (passed from GitHub Actions)
if [ -n "$BOOKSWAPS_ENV" ]; then
    echo "$BOOKSWAPS_ENV" > .env
    echo "✅ Environment file created from GitHub Actions"
else
    echo "⚠️  Using existing .env file"
fi

# Stop containers
docker-compose -f docker-compose.prod.yml down

# Rebuild and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 60

# Run migrations
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Check if everything is running
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment completed successfully!"
echo "🌐 Site: https://bookswaps.co.ke"
echo "🔧 Admin: https://bookswaps.co.ke/admin"
