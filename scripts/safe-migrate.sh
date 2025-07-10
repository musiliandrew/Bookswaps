#!/bin/bash

# Safe Database Migration Script for BookSwaps
# This script performs careful database migrations with backups

set -e

echo "🛡️  BookSwaps Safe Database Migration"
echo "===================================="

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
BACKUP_DIR="/home/musili/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="pre_migration_backup_${TIMESTAMP}.sql"

# Step 1: Create backup
log_info "Step 1: Creating pre-migration backup"

mkdir -p $BACKUP_DIR

if docker compose exec -T db pg_dump -U bookswaps_user bookswaps_prod > "$BACKUP_DIR/$BACKUP_FILE"; then
    log_success "Backup created: $BACKUP_FILE"
else
    log_warning "Backup failed - database might not exist yet"
fi

# Step 2: Check migration status
log_info "Step 2: Checking current migration status"

log_info "Current migrations applied:"
docker compose exec backend python manage.py showmigrations --settings=settings_production

# Step 3: Show pending migrations
log_info "Step 3: Checking for pending migrations"

PENDING_MIGRATIONS=$(docker compose exec backend python manage.py showmigrations --plan --settings=settings_production | grep -c "\\[ \\]" || echo "0")

if [ "$PENDING_MIGRATIONS" -gt 0 ]; then
    log_warning "Found $PENDING_MIGRATIONS pending migrations"
    
    log_info "Pending migrations:"
    docker compose exec backend python manage.py showmigrations --plan --settings=settings_production | grep "\\[ \\]"
    
    echo ""
    log_warning "⚠️  IMPORTANT: Review the migrations above carefully!"
    echo ""
    echo "These migrations will be applied to your production database."
    echo "Make sure you understand what each migration does."
    echo ""
    
    read -p "Do you want to proceed with these migrations? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Migration cancelled by user"
        exit 0
    fi
    
    # Step 4: Apply migrations
    log_info "Step 4: Applying migrations"
    
    if docker compose exec backend python manage.py migrate --settings=settings_production; then
        log_success "Migrations applied successfully!"
    else
        log_error "Migration failed!"
        log_info "Attempting to restore from backup..."
        
        if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
            log_info "Restoring database from backup..."
            docker compose exec -T db psql -U bookswaps_user -d bookswaps_prod < "$BACKUP_DIR/$BACKUP_FILE"
            log_success "Database restored from backup"
        else
            log_error "No backup file found for restoration"
        fi
        
        exit 1
    fi
    
    # Step 5: Verify migration
    log_info "Step 5: Verifying migration"
    
    log_info "Final migration status:"
    docker compose exec backend python manage.py showmigrations --settings=settings_production
    
    # Test database connection
    if docker compose exec backend python manage.py shell --settings=settings_production -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('Database connection successful')
"; then
        log_success "Database connection verified"
    else
        log_error "Database connection failed after migration"
        exit 1
    fi
    
else
    log_success "No pending migrations found"
fi

# Step 6: Collect static files
log_info "Step 6: Collecting static files"

if docker compose exec backend python manage.py collectstatic --noinput --settings=settings_production; then
    log_success "Static files collected"
else
    log_warning "Static file collection failed"
fi

echo ""
log_success "🎉 Safe migration completed!"
echo ""
log_info "Backup location: $BACKUP_DIR/$BACKUP_FILE"
log_info "Keep this backup until you're sure the migration was successful"
