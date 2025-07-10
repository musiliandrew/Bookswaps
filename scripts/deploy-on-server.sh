#!/bin/bash

# BookSwaps Server-Side Deployment Script
# Run this script ON the production server

set -e  # Exit on any error

echo "🚀 BookSwaps Server Deployment"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Stop existing services (if running)
log_info "Step 1: Stopping existing services"

if docker compose ps | grep -q "Up"; then
    log_info "Stopping existing containers..."
    docker compose down || log_warning "No existing containers to stop"
else
    log_info "No running containers found"
fi

log_success "Services stopped"

# Step 2: Build new images
log_info "Step 2: Building application images"

log_info "Building frontend..."
docker compose build frontend

log_info "Building backend..."
docker compose build backend

log_success "Images built successfully"

# Step 3: Database migration check
log_info "Step 3: Database migration preparation"

# Start database first
log_info "Starting database service..."
docker compose up -d db redis

# Wait for database to be ready
log_info "Waiting for database to be ready..."
sleep 10

# Check if we need to run migrations
log_info "Checking database migration status..."

# Create database if it doesn't exist
docker compose exec -T db psql -U bookswaps_user -d postgres -c "CREATE DATABASE bookswaps_prod;" 2>/dev/null || log_info "Database already exists"

# Run migrations
log_info "Running database migrations..."
docker compose run --rm backend python manage.py migrate --settings=settings_production

log_success "Database migrations completed"

# Step 4: Start all services
log_info "Step 4: Starting all services"

# Start MinIO and wait for it to be healthy
log_info "Starting MinIO..."
docker compose up -d minio

# Wait for MinIO to be healthy
log_info "Waiting for MinIO to be healthy..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose exec minio mc ready local > /dev/null 2>&1; then
        log_success "MinIO is ready"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    log_error "MinIO failed to start within $timeout seconds"
    exit 1
fi

# Initialize MinIO buckets
log_info "Initializing MinIO buckets..."
docker compose up -d minio-init

# Start backend
log_info "Starting backend..."
docker compose up -d backend

# Start frontend
log_info "Starting frontend..."
docker compose up -d frontend

# Start nginx
log_info "Starting nginx..."
docker compose up -d nginx

log_success "All services started"

# Step 5: Health checks
log_info "Step 5: Running health checks"

sleep 10

# Check if services are running
SERVICES=("db" "redis" "minio" "backend" "frontend" "nginx")

for service in "${SERVICES[@]}"; do
    if docker compose ps $service | grep -q "Up"; then
        log_success "$service is running"
    else
        log_error "$service is not running"
        docker compose logs $service
        exit 1
    fi
done

# Step 6: Collect static files
log_info "Step 6: Collecting static files"
docker compose exec backend python manage.py collectstatic --noinput --settings=settings_production

log_success "Static files collected"

# Step 7: Create superuser (if needed)
log_info "Step 7: Checking for superuser"

if docker compose exec -T backend python manage.py shell --settings=settings_production -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('NO_SUPERUSER')
else:
    print('SUPERUSER_EXISTS')
" | grep -q "NO_SUPERUSER"; then
    log_warning "No superuser found. You may want to create one:"
    echo "docker compose exec backend python manage.py createsuperuser --settings=settings_production"
else
    log_success "Superuser exists"
fi

echo ""
log_success "🎉 Deployment completed successfully!"
echo ""
log_info "Services Status:"
docker compose ps

echo ""
log_info "Next steps:"
echo "1. Set up SSL certificates: ./scripts/setup-ssl.sh"
echo "2. Configure PWA features"
echo "3. Test the application at: http://bookswaps.co.ke"
echo ""
log_info "Useful commands:"
echo "- View logs: docker compose logs -f [service_name]"
echo "- Restart service: docker compose restart [service_name]"
echo "- Check status: docker compose ps"
