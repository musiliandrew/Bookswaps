#!/bin/bash

# BookSwaps Production Deployment Script
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on any error

echo "🚀 BookSwaps Production Deployment"
echo "=================================="

# Configuration
PRODUCTION_SERVER="178.32.191.152"
PRODUCTION_USER="musili"
PRODUCTION_DOMAIN="bookswaps.co.ke"
BACKUP_DIR="/home/musili/backups"
APP_DIR="/home/musili/BookSwaps"

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

# Function to run commands on production server
run_remote() {
    ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER "$1"
}

# Function to copy files to production server
copy_to_production() {
    scp -o StrictHostKeyChecking=no -r "$1" $PRODUCTION_USER@$PRODUCTION_SERVER:"$2"
}

# Step 1: Pre-deployment checks
log_info "Step 1: Pre-deployment checks"

# Check if we can connect to production server
if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_SERVER "echo 'Connection successful'" > /dev/null 2>&1; then
    log_error "Cannot connect to production server $PRODUCTION_SERVER"
    exit 1
fi
log_success "Production server connection verified"

# Check if Docker is running on production
if ! run_remote "docker --version" > /dev/null 2>&1; then
    log_error "Docker is not available on production server"
    exit 1
fi
log_success "Docker is available on production server"

# Step 2: Create database backup
log_info "Step 2: Creating database backup"

BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="bookswaps_backup_${BACKUP_TIMESTAMP}.sql"

run_remote "mkdir -p $BACKUP_DIR"

# Create database backup
run_remote "cd $APP_DIR && docker compose exec -T db pg_dump -U bookswaps_user bookswaps_prod > $BACKUP_DIR/$BACKUP_FILE" || {
    log_warning "Database backup failed - this might be expected if database doesn't exist yet"
}

log_success "Database backup created (if database existed): $BACKUP_FILE"

# Step 3: Prepare application directory
log_info "Step 3: Preparing application directory"

run_remote "mkdir -p $APP_DIR"
log_success "Application directory prepared"

# Step 4: Copy application files
log_info "Step 4: Copying application files to production"

# Create a temporary directory for deployment files
TEMP_DEPLOY_DIR=$(mktemp -d)
log_info "Using temporary directory: $TEMP_DEPLOY_DIR"

# Copy necessary files to temp directory
cp -r . "$TEMP_DEPLOY_DIR/BookSwaps"

# Remove unnecessary files
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/.git"
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/node_modules"
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/backend/env"
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/.venv"
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/__pycache__"
rm -rf "$TEMP_DEPLOY_DIR/BookSwaps/backend/__pycache__"

# Copy to production server
copy_to_production "$TEMP_DEPLOY_DIR/BookSwaps" "/home/musili/"

# Clean up temp directory
rm -rf "$TEMP_DEPLOY_DIR"

log_success "Application files copied to production"

# Step 5: Set up environment and permissions
log_info "Step 5: Setting up environment and permissions"

run_remote "cd $APP_DIR && chmod +x scripts/*.sh"
run_remote "cd $APP_DIR && chmod 644 .env"

log_success "Permissions set correctly"

echo ""
log_success "Pre-deployment preparation completed!"
echo ""
log_info "Next steps:"
echo "1. SSH to production server: ssh $PRODUCTION_USER@$PRODUCTION_SERVER"
echo "2. Navigate to app directory: cd $APP_DIR"
echo "3. Run the deployment: ./scripts/deploy-on-server.sh"
echo ""
log_warning "Remember to verify database migrations before proceeding!"
