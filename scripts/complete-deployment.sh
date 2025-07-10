#!/bin/bash

# Complete BookSwaps Production Deployment Script
# This script handles the entire deployment process

set -e

echo "🚀 BookSwaps Complete Production Deployment"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configuration
PRODUCTION_SERVER="178.32.191.152"
PRODUCTION_USER="musili"
PRODUCTION_DOMAIN="bookswaps.co.ke"

# Step 1: Pre-deployment preparation
log_info "Step 1: Pre-deployment preparation"

# Make sure we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if we can connect to production server
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER "echo 'Connection successful'" > /dev/null 2>&1; then
    log_error "Cannot connect to production server $PRODUCTION_SERVER"
    log_info "Please ensure:"
    echo "  - SSH key is set up"
    echo "  - Server is accessible"
    echo "  - User has proper permissions"
    exit 1
fi

log_success "Production server connection verified"

# Step 2: Deploy to production server
log_info "Step 2: Deploying to production server"

if ! ./scripts/deploy-production.sh; then
    log_error "Deployment to production server failed"
    exit 1
fi

log_success "Files deployed to production server"

# Step 3: SSH to production and run deployment
log_info "Step 3: Running deployment on production server"

ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER << 'ENDSSH'
    set -e
    
    # Colors for remote execution
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
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
    
    # Navigate to app directory
    cd /home/musili/BookSwaps
    
    log_info "Starting production deployment on server..."
    
    # Run the server deployment script
    if [ -f "./scripts/deploy-on-server.sh" ]; then
        chmod +x ./scripts/deploy-on-server.sh
        ./scripts/deploy-on-server.sh
    else
        log_error "deploy-on-server.sh not found"
        exit 1
    fi
    
    log_success "Server deployment completed"
ENDSSH

if [ $? -ne 0 ]; then
    log_error "Server deployment failed"
    exit 1
fi

log_success "Production deployment completed"

# Step 4: SSL Certificate setup
log_info "Step 4: Setting up SSL certificates"

ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER << 'ENDSSH'
    set -e
    
    # Colors for remote execution
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
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
    
    # Navigate to app directory
    cd /home/musili/BookSwaps
    
    log_info "Setting up SSL certificates..."
    
    # Run SSL setup script
    if [ -f "./scripts/setup-ssl.sh" ]; then
        chmod +x ./scripts/setup-ssl.sh
        ./scripts/setup-ssl.sh
    else
        log_warning "SSL setup script not found, skipping SSL setup"
        log_info "You can run SSL setup later with: ./scripts/setup-ssl.sh"
    fi
    
    log_success "SSL setup completed"
ENDSSH

if [ $? -ne 0 ]; then
    log_warning "SSL setup failed, but deployment can continue"
    log_info "You can set up SSL later by running: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && ./scripts/setup-ssl.sh'"
fi

# Step 5: PWA setup
log_info "Step 5: Setting up PWA features"

ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER << 'ENDSSH'
    set -e
    
    # Colors for remote execution
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
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
    
    # Navigate to app directory
    cd /home/musili/BookSwaps
    
    log_info "Setting up PWA features..."
    
    # Run PWA setup script
    if [ -f "./scripts/setup-pwa.sh" ]; then
        chmod +x ./scripts/setup-pwa.sh
        ./scripts/setup-pwa.sh
    else
        log_warning "PWA setup script not found, skipping PWA setup"
    fi
    
    # Rebuild frontend with PWA features
    log_info "Rebuilding frontend with PWA features..."
    docker compose build frontend
    docker compose restart frontend
    
    log_success "PWA setup completed"
ENDSSH

if [ $? -ne 0 ]; then
    log_warning "PWA setup failed, but deployment can continue"
fi

# Step 6: Final health checks
log_info "Step 6: Running final health checks"

ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER << 'ENDSSH'
    set -e
    
    # Colors for remote execution
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
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
    
    # Navigate to app directory
    cd /home/musili/BookSwaps
    
    log_info "Running final health checks..."
    
    # Check service status
    log_info "Service status:"
    docker compose ps
    
    # Test database connection
    log_info "Testing database connection..."
    if docker compose exec -T backend python manage.py shell --settings=settings_production -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('Database connection successful')
"; then
        log_success "Database connection verified"
    else
        log_error "Database connection failed"
    fi
    
    # Test API endpoint
    log_info "Testing API endpoint..."
    if curl -f -s http://localhost:8000/api/health/ > /dev/null; then
        log_success "API endpoint responding"
    else
        log_warning "API endpoint not responding (this might be normal if health endpoint doesn't exist)"
    fi
    
    log_success "Health checks completed"
ENDSSH

echo ""
log_success "🎉 Complete deployment finished!"
echo ""
log_info "Your BookSwaps application is now deployed at:"
echo "  🌐 HTTP: http://bookswaps.co.ke"
echo "  🔒 HTTPS: https://bookswaps.co.ke (if SSL was set up successfully)"
echo ""
log_info "Next steps:"
echo "  1. Test the application thoroughly"
echo "  2. Create a superuser if needed:"
echo "     ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && docker compose exec backend python manage.py createsuperuser --settings=settings_production'"
echo "  3. Monitor logs: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && docker compose logs -f'"
echo "  4. Set up monitoring and backups"
echo ""
log_info "Useful commands:"
echo "  - Check status: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && docker compose ps'"
echo "  - View logs: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && docker compose logs -f [service]'"
echo "  - Restart service: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'cd /home/musili/BookSwaps && docker compose restart [service]'"
