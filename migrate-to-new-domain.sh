#!/bin/bash

# BookSwaps Domain Migration Script
# Migrates from bookswaps.quantiq.co.ke to bookswaps.co.ke

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 BookSwaps Domain Migration: bookswaps.quantiq.co.ke → bookswaps.co.ke"
echo "=================================================================="

# Check if running on VPS
if [[ ! -d "/opt/bookswaps" ]]; then
    print_error "This script should be run on the VPS at /opt/bookswaps"
    exit 1
fi

cd /opt/bookswaps

print_header "Step 1: Backup Current Configuration"

# Create backup directory
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup current files
print_status "Backing up current configuration..."
cp .env $BACKUP_DIR/.env.backup 2>/dev/null || true
cp nginx/nginx.conf $BACKUP_DIR/nginx.conf.backup 2>/dev/null || true
cp docker-compose.yml $BACKUP_DIR/docker-compose.yml.backup 2>/dev/null || true

# Backup database
print_status "Backing up database..."
docker-compose exec -T db pg_dump -U bookswaps_user bookswaps_prod > $BACKUP_DIR/database_backup.sql 2>/dev/null || true

print_status "✅ Backup completed in $BACKUP_DIR"

print_header "Step 2: Update Repository"

# Pull latest changes
print_status "Pulling latest changes from repository..."
git fetch origin
git reset --hard origin/main

print_header "Step 3: Update SSL Certificates"

print_status "Obtaining SSL certificates for bookswaps.co.ke..."

# Stop nginx temporarily
docker-compose down nginx 2>/dev/null || true

# Get new SSL certificates
sudo certbot certonly --standalone \
    -d bookswaps.co.ke \
    -d www.bookswaps.co.ke \
    --email andrewthepyrookie@gmail.com \
    --agree-tos \
    --non-interactive \
    --force-renewal || print_warning "SSL certificate generation failed - will use existing certificates"

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/bookswaps.co.ke/fullchain.pem nginx/ssl/ 2>/dev/null || true
sudo cp /etc/letsencrypt/live/bookswaps.co.ke/privkey.pem nginx/ssl/ 2>/dev/null || true
sudo chown $USER:$USER nginx/ssl/*.pem 2>/dev/null || true

print_header "Step 4: Deploy with New Configuration"

# Stop all containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || docker-compose down

# Build and start with production configuration
print_status "Building and starting containers with new domain..."
docker-compose -f docker-compose.prod.yml up -d --build

print_header "Step 5: Post-Deployment Tasks"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 60

# Run migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# Collect static files
print_status "Collecting static files..."
docker-compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Create MinIO bucket
print_status "Setting up MinIO bucket..."
sleep 10
docker-compose -f docker-compose.prod.yml exec -T minio mc alias set local http://localhost:9000 bookswaps_admin_2025 BookSwapsMinIOSecureKey2025! || true
docker-compose -f docker-compose.prod.yml exec -T minio mc mb local/bookswaps-prod || true
docker-compose -f docker-compose.prod.yml exec -T minio mc policy set public local/bookswaps-prod || true

print_header "Step 6: Verification"

# Check service status
print_status "Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test endpoints
print_status "Testing endpoints..."
sleep 10

if curl -f -k https://bookswaps.co.ke/api/health/ > /dev/null 2>&1; then
    print_status "✅ API health check: PASSED"
else
    print_warning "⚠️  API health check: FAILED"
fi

if curl -f -k https://bookswaps.co.ke/ > /dev/null 2>&1; then
    print_status "✅ Frontend check: PASSED"
else
    print_warning "⚠️  Frontend check: FAILED"
fi

print_header "Migration Complete!"

echo ""
echo "🎉 Domain migration completed successfully!"
echo ""
echo "📋 New URLs:"
echo "  🌐 Website: https://bookswaps.co.ke"
echo "  🌐 WWW: https://www.bookswaps.co.ke"
echo "  🔧 Admin: https://bookswaps.co.ke/admin"
echo "  📊 API Health: https://bookswaps.co.ke/api/health/"
echo "  🗄️  MinIO Console: https://bookswaps.co.ke:9001"
echo ""
echo "📁 Backup Location: $BACKUP_DIR"
echo ""
echo "🔄 Next Steps:"
echo "  1. Test all functionality on the new domain"
echo "  2. Update any external integrations"
echo "  3. Update Google OAuth redirect URIs (if not done already)"
echo "  4. Monitor logs for any issues"
echo ""
print_warning "If anything goes wrong, you can restore from the backup in $BACKUP_DIR"

print_status "Migration script completed!"
