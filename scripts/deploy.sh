#!/bin/bash

# BookSwaps Production Deployment Script
# This script handles the complete deployment process on your VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/bookswaps"
BACKUP_DIR="/opt/bookswaps/backups"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "Running as root. Consider using a dedicated user for deployments."
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    log_success "All prerequisites are met."
}

# Create application directory structure
setup_directories() {
    log_info "Setting up directory structure..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /opt/bookswaps/ssl
    sudo mkdir -p /opt/bookswaps/logs
    
    # Set proper permissions
    sudo chown -R $USER:$USER $APP_DIR
    
    log_success "Directory structure created."
}

# Clone or update repository
update_code() {
    log_info "Updating application code..."
    
    if [ -d "$APP_DIR/.git" ]; then
        cd $APP_DIR
        git fetch origin
        git reset --hard origin/main
        log_success "Code updated from repository."
    else
        log_info "Cloning repository..."
        git clone https://github.com/musiliandrew/Bookswaps.git $APP_DIR
        cd $APP_DIR
        log_success "Repository cloned."
    fi
}

# Setup environment file
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f "$APP_DIR/$ENV_FILE" ]; then
        if [ -f "$APP_DIR/.env.production.example" ]; then
            cp $APP_DIR/.env.production.example $APP_DIR/$ENV_FILE
            log_warning "Environment file created from example. Please edit $APP_DIR/$ENV_FILE with your actual values."
            log_warning "Deployment will pause here. Press Enter after editing the environment file."
            read -p "Press Enter to continue..."
        else
            log_error "No environment example file found. Please create $APP_DIR/$ENV_FILE manually."
            exit 1
        fi
    else
        log_success "Environment file already exists."
    fi
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ ! -f "/opt/bookswaps/ssl/fullchain.pem" ] || [ ! -f "/opt/bookswaps/ssl/privkey.pem" ]; then
        log_warning "SSL certificates not found."
        echo "Options:"
        echo "1. Use Let's Encrypt (recommended)"
        echo "2. Use custom certificates"
        echo "3. Skip SSL setup (not recommended for production)"
        read -p "Choose option (1-3): " ssl_option
        
        case $ssl_option in
            1)
                setup_letsencrypt
                ;;
            2)
                log_info "Please place your SSL certificates in:"
                log_info "  - Certificate: /opt/bookswaps/ssl/fullchain.pem"
                log_info "  - Private Key: /opt/bookswaps/ssl/privkey.pem"
                read -p "Press Enter after placing the certificates..."
                ;;
            3)
                log_warning "Skipping SSL setup. Your site will not be secure!"
                ;;
            *)
                log_error "Invalid option. Exiting."
                exit 1
                ;;
        esac
    else
        log_success "SSL certificates found."
    fi
}

# Setup Let's Encrypt certificates
setup_letsencrypt() {
    log_info "Setting up Let's Encrypt certificates..."
    
    read -p "Enter your domain name: " domain_name
    read -p "Enter your email address: " email_address
    
    # Install certbot if not present
    if ! command -v certbot &> /dev/null; then
        log_info "Installing certbot..."
        sudo apt update
        sudo apt install -y certbot
    fi
    
    # Generate certificates
    sudo certbot certonly --standalone \
        --email $email_address \
        --agree-tos \
        --no-eff-email \
        -d $domain_name
    
    # Copy certificates to our SSL directory
    sudo cp /etc/letsencrypt/live/$domain_name/fullchain.pem /opt/bookswaps/ssl/
    sudo cp /etc/letsencrypt/live/$domain_name/privkey.pem /opt/bookswaps/ssl/
    sudo chown $USER:$USER /opt/bookswaps/ssl/*
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $APP_DIR/$COMPOSE_FILE restart nginx" | sudo crontab -
    
    log_success "Let's Encrypt certificates configured."
}

# Create database backup
backup_database() {
    log_info "Creating database backup..."
    
    if docker-compose -f $COMPOSE_FILE ps postgres | grep -q "Up"; then
        backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U bookswaps bookswaps > $backup_file
        gzip $backup_file
        log_success "Database backup created: ${backup_file}.gz"
    else
        log_warning "Database not running, skipping backup."
    fi
}

# Deploy application
deploy_application() {
    log_info "Deploying application..."
    
    cd $APP_DIR
    
    # Pull latest images
    docker-compose -f $COMPOSE_FILE pull
    
    # Start infrastructure services first
    docker-compose -f $COMPOSE_FILE up -d postgres redis minio
    
    # Wait for services to be ready
    log_info "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Run database migrations
    docker-compose -f $COMPOSE_FILE run --rm backend python manage.py migrate
    
    # Collect static files
    docker-compose -f $COMPOSE_FILE run --rm backend python manage.py collectstatic --noinput
    
    # Start application services
    docker-compose -f $COMPOSE_FILE up -d
    
    log_success "Application deployed successfully."
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Wait for services to start
    sleep 60
    
    # Check if services are running
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_success "All services are running."
        
        # Test API endpoint
        if curl -f http://localhost/api/health/ > /dev/null 2>&1; then
            log_success "API health check passed."
        else
            log_warning "API health check failed. Check logs with: docker-compose -f $COMPOSE_FILE logs backend"
        fi
        
        # Test frontend
        if curl -f http://localhost/ > /dev/null 2>&1; then
            log_success "Frontend health check passed."
        else
            log_warning "Frontend health check failed. Check logs with: docker-compose -f $COMPOSE_FILE logs frontend"
        fi
    else
        log_error "Some services are not running properly."
        docker-compose -f $COMPOSE_FILE ps
        exit 1
    fi
}

# Cleanup old images and containers
cleanup() {
    log_info "Cleaning up old Docker images and containers..."
    
    docker system prune -f
    docker image prune -f
    
    log_success "Cleanup completed."
}

# Main deployment process
main() {
    log_info "Starting BookSwaps deployment..."
    
    check_permissions
    check_prerequisites
    setup_directories
    update_code
    setup_environment
    setup_ssl
    backup_database
    deploy_application
    health_check
    cleanup
    
    log_success "🚀 BookSwaps deployment completed successfully!"
    log_info "Your application should be available at: https://$(grep DOMAIN_NAME $APP_DIR/$ENV_FILE | cut -d'=' -f2)"
    log_info "To view logs: docker-compose -f $APP_DIR/$COMPOSE_FILE logs -f"
    log_info "To stop services: docker-compose -f $APP_DIR/$COMPOSE_FILE down"
}

# Run main function
main "$@"
