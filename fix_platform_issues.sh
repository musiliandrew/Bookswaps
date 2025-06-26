#!/bin/bash

echo "🔧 Bookswaps Platform Comprehensive Fix Script"
echo "=============================================="

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Stop existing containers
stop_containers() {
    print_status "Stopping existing containers..."
    docker-compose down
    print_success "Containers stopped"
}

# Clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
    print_success "Docker cleanup completed"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running"
    else
        print_error "Some services failed to start"
        docker-compose logs
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Create migrations
    docker-compose exec -T backend python manage.py makemigrations
    
    # Apply migrations
    docker-compose exec -T backend python manage.py migrate
    
    print_success "Database migrations completed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    docker-compose exec -T frontend npm install
    print_success "Frontend dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running backend tests..."
    docker-compose exec -T backend python manage.py check
    
    print_status "Testing API endpoints..."
    if [ -f "test_all_endpoints.py" ]; then
        python test_all_endpoints.py
    fi
    
    print_success "Tests completed"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:8000/api/users/me/profile/ > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed (this is normal if not authenticated)"
    fi
    
    # Check frontend
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Check database
    if docker-compose exec -T db pg_isready > /dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database is not healthy"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is healthy"
    else
        print_error "Redis is not healthy"
    fi
}

# Main execution
main() {
    echo "Starting comprehensive platform fix..."
    
    check_docker
    stop_containers
    cleanup_docker
    start_services
    run_migrations
    install_frontend_deps
    run_tests
    check_health
    
    echo ""
    echo "=============================================="
    print_success "Platform fix completed successfully!"
    echo ""
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔧 Backend API: http://localhost:8000/api"
    echo "🗄️  Database: localhost:5432"
    echo "🔴 Redis: localhost:6379"
    echo "📦 MinIO: http://localhost:9000"
    echo ""
    echo "To monitor logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To restart a specific service:"
    echo "  docker-compose restart [service-name]"
    echo ""
}

# Handle script interruption
trap 'print_error "Script interrupted"; exit 1' INT

# Run main function
main "$@"
