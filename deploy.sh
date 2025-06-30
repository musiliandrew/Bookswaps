#!/bin/bash

# BookSwaps Production Deployment Script
# Run this script on your VPS to deploy the application

set -e  # Exit on any error

echo "🚀 Starting BookSwaps deployment..."

# Configuration
PROJECT_DIR="/opt/bookswaps"
DOMAIN="bookswaps.quantiq.co.ke"
EMAIL="andrewthepyrookie@gmail.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 9000  # MinIO
sudo ufw allow 9001  # MinIO Console
sudo ufw --force enable

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    print_status "Docker is already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone or update repository
cd $PROJECT_DIR
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git fetch origin
    git reset --hard origin/main
else
    print_status "Cloning repository..."
    git clone https://github.com/musiliandrew/Bookswaps.git .
fi

# Create production environment file
print_status "Creating production environment file..."
cat > .env.production << 'EOF'
# Database Configuration
DB_NAME=bookswaps_prod
DB_USER=bookswaps_user
DB_PASSWORD=BookSwaps2025SecurePassword123!
DB_HOST=db
DB_PORT=5432

# Django Configuration
SECRET_KEY=django-insecure-bookswaps-production-key-2025-very-secure-random-string-change-this
DEBUG=False
ALLOWED_HOSTS=bookswaps.quantiq.co.ke,www.bookswaps.quantiq.co.ke,quantiq.co.ke,178.32.191.152

# Frontend URL
FRONTEND_URL=https://bookswaps.quantiq.co.ke

# MinIO Configuration
MINIO_ACCESS_KEY=bookswaps_admin_2025
MINIO_SECRET_KEY=BookSwapsMinIOSecureKey2025!
MINIO_BUCKET_NAME=bookswaps-prod
MINIO_ENDPOINT_URL=https://bookswaps.quantiq.co.ke:9000
MINIO_REGION=us-east-1

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=andrewthepyrookie@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password_here
DEFAULT_FROM_EMAIL=noreply@bookswaps.quantiq.co.ke

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
X_FRAME_OPTIONS=DENY

# WebSocket URLs
VITE_WS_URL=wss://bookswaps.quantiq.co.ke/ws/
VITE_API_URL=https://bookswaps.quantiq.co.ke/api/
EOF

print_warning "Please update the EMAIL_HOST_PASSWORD in .env.production with your Gmail app password"

# Create SSL certificate directory
print_status "Creating SSL certificate directory..."
sudo mkdir -p /etc/nginx/ssl
sudo mkdir -p ./nginx/ssl

# Obtain SSL certificate
print_status "Obtaining SSL certificate..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    sudo certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates to nginx directory
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/
    sudo chown $USER:$USER ./nginx/ssl/*
else
    print_status "SSL certificate already exists"
    # Copy existing certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/
    sudo chown $USER:$USER ./nginx/ssl/*
fi

# Set up certificate renewal
print_status "Setting up certificate auto-renewal..."
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx" | sudo crontab -

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 60

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# Collect static files
print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Create superuser
print_status "Creating superuser..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py shell << 'PYTHON'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@quantiq.co.ke', 'BookSwaps2025Admin!')
    print("Superuser created successfully")
else:
    print("Superuser already exists")
PYTHON

# Create MinIO bucket
print_status "Creating MinIO bucket..."
sleep 10
docker-compose -f docker-compose.prod.yml exec -T minio mc alias set local http://localhost:9000 bookswaps_admin_2025 BookSwapsMinIOSecureKey2025! || true
docker-compose -f docker-compose.prod.yml exec -T minio mc mb local/bookswaps-prod || true
docker-compose -f docker-compose.prod.yml exec -T minio mc policy set public local/bookswaps-prod || true

# Display status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Display final information
echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "  🌐 Website: https://$DOMAIN"
echo "  🔧 Admin Panel: https://$DOMAIN/admin"
echo "  📊 MinIO Console: https://$DOMAIN:9001"
echo "  👤 Admin Username: admin"
echo "  🔑 Admin Password: BookSwaps2025Admin!"
echo ""
echo "📝 Next Steps:"
echo "  1. Update EMAIL_HOST_PASSWORD in .env.production"
echo "  2. Configure Google OAuth credentials"
echo "  3. Set up monitoring and backups"
echo "  4. Test all functionality"
echo ""
print_warning "Remember to change default passwords and secure your server!"

print_status "Deployment script completed!"
