#!/bin/bash

# BookSwaps Production Deployment Script
# This script deploys the application using production-optimized Docker containers

set -e

echo "🚀 Starting BookSwaps Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_requirements() {
    print_status "Checking deployment requirements..."
    
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        exit 1
    fi
    
    if [ ! -f "docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found!"
        exit 1
    fi
    
    if [ ! -f "nginx/nginx.prod.conf" ]; then
        print_error "nginx/nginx.prod.conf not found!"
        exit 1
    fi
    
    print_success "All required files found"
}

# Stop existing containers
stop_existing() {
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.yml down || true
    docker-compose -f docker-compose.prod.yml down || true
    print_success "Existing containers stopped"
}

# Clean up old images (optional)
cleanup_images() {
    print_status "Cleaning up old Docker images..."
    docker system prune -f || true
    print_success "Cleanup completed"
}

# Build and start production containers
deploy_production() {
    print_status "Building production containers..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_status "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production containers started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    sleep 10
    
    # Wait for backend
    print_status "Waiting for backend..."
    for i in {1..30}; do
        if docker-compose -f docker-compose.prod.yml exec -T backend python -c "import django; django.setup()" 2>/dev/null; then
            break
        fi
        sleep 2
    done
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    sleep 5
    
    print_success "Services are ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
    print_success "Database migrations completed"
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput
    print_success "Static files collected"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check backend health
    if docker-compose -f docker-compose.prod.yml exec -T backend python manage.py check --deploy 2>/dev/null; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check if services are responding
    sleep 5
    if curl -f -s http://localhost/health > /dev/null; then
        print_success "Application is responding"
    else
        print_warning "Application health check failed"
    fi
}

# Show logs
show_logs() {
    print_status "Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=20
}

# Main deployment process
main() {
    echo "========================================"
    echo "   BookSwaps Production Deployment     "
    echo "========================================"
    
    check_requirements
    stop_existing
    cleanup_images
    deploy_production
    wait_for_services
    run_migrations
    collect_static
    health_check
    
    print_success "🎉 Production deployment completed!"
    print_status "Application should be available at: https://bookswaps.quantiq.co.ke"
    
    echo ""
    print_status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "To stop: docker-compose -f docker-compose.prod.yml down"
    
    show_logs
}

# Run main function
main "$@"
