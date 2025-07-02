#!/bin/bash

# BookSwaps Local Development Management Script
# This script helps you manage your local development environment
# while keeping your production deployment separate and safe.

set -e

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting local development environment..."
    check_docker
    
    # Use both docker-compose files for development overrides
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 15
    
    # Check if services are healthy
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "✅ Local development environment is running!"
        print_status "🌐 Frontend: http://localhost"
        print_status "🔧 Backend API: http://localhost/api/"
        print_status "🗄️  MinIO Console: http://localhost:9001"
        print_status "📊 Direct Backend: http://localhost:8000"
        print_status "⚡ Direct Frontend: http://localhost:5173"
    else
        print_warning "Services started but health check failed. Check logs with: ./dev-local.sh logs"
    fi
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping local development environment..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml down
    print_success "✅ Development environment stopped"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting local development environment..."
    stop_dev
    start_dev
}

# Function to show logs
show_logs() {
    if [ -z "$2" ]; then
        print_status "Showing logs for all services..."
        docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f
    else
        print_status "Showing logs for $2..."
        docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f "$2"
    fi
}

# Function to show status
show_status() {
    print_status "Development environment status:"
    docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
    
    echo ""
    print_status "Service health checks:"
    
    # Check main health endpoint
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "✅ Nginx proxy: healthy"
    else
        print_error "❌ Nginx proxy: unhealthy"
    fi
    
    # Check API health
    if curl -f http://localhost/api/health/ > /dev/null 2>&1; then
        print_success "✅ Backend API: healthy"
    else
        print_error "❌ Backend API: unhealthy"
    fi
    
    # Check frontend
    if curl -f http://localhost/ > /dev/null 2>&1; then
        print_success "✅ Frontend: healthy"
    else
        print_error "❌ Frontend: unhealthy"
    fi
}

# Function to clean up development environment
clean_dev() {
    print_warning "This will remove all containers, networks, and volumes for development."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up development environment..."
        docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        print_success "✅ Development environment cleaned"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py migrate
    print_success "✅ Migrations completed"
}

# Function to create superuser
create_superuser() {
    print_status "Creating Django superuser..."
    docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python manage.py createsuperuser
}

# Function to show help
show_help() {
    echo "BookSwaps Local Development Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  restart     Restart the development environment"
    echo "  status      Show status of all services"
    echo "  logs [svc]  Show logs (optionally for specific service)"
    echo "  clean       Clean up all development containers and volumes"
    echo "  migrate     Run database migrations"
    echo "  superuser   Create Django superuser"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start development environment"
    echo "  $0 logs backend          # Show backend logs"
    echo "  $0 status                # Check service status"
    echo ""
    echo "🚨 Note: This script is for LOCAL DEVELOPMENT only."
    echo "   Your production deployment remains unchanged and safe."
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    clean)
        clean_dev
        ;;
    migrate)
        run_migrations
        ;;
    superuser)
        create_superuser
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
