#!/bin/bash

# BookSwaps Database Backup Script
# Automated backup with rotation and compression

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME="${DB_NAME:-bookswaps}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="bookswaps_backup_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if running in Docker
check_environment() {
    log "Checking environment..."
    
    if [ -f /.dockerenv ]; then
        log "Running inside Docker container"
        DOCKER_MODE=true
    else
        log "Running on host system"
        DOCKER_MODE=false
    fi
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi
}

# Create backup directory
create_backup_dir() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    
    if [ ! -w "$BACKUP_DIR" ]; then
        error "Backup directory is not writable: $BACKUP_DIR"
        exit 1
    fi
}

# Test database connection
test_connection() {
    log "Testing database connection..."
    
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log "Database connection successful"
    else
        error "Cannot connect to database. Please check connection parameters."
        exit 1
    fi
}

# Create database backup
create_backup() {
    log "Creating database backup..."
    
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    # Create backup with verbose output
    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=custom \
        --compress=9 \
        --file="$backup_path"; then
        
        log "Database backup created: $backup_path"
        
        # Get backup file size
        local size=$(du -h "$backup_path" | cut -f1)
        log "Backup size: $size"
        
        return 0
    else
        error "Failed to create database backup"
        return 1
    fi
}

# Compress backup (if using plain format)
compress_backup() {
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    local compressed_path="$BACKUP_DIR/$COMPRESSED_FILE"
    
    if [ -f "$backup_path" ]; then
        log "Compressing backup..."
        
        if gzip "$backup_path"; then
            log "Backup compressed: $compressed_path"
            
            # Get compressed file size
            local size=$(du -h "$compressed_path" | cut -f1)
            log "Compressed size: $size"
        else
            warning "Failed to compress backup"
        fi
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    log "Verifying backup integrity..."
    
    # Check if backup file exists and is not empty
    if [ ! -f "$backup_path" ]; then
        error "Backup file not found: $backup_path"
        return 1
    fi
    
    if [ ! -s "$backup_path" ]; then
        error "Backup file is empty: $backup_path"
        return 1
    fi
    
    # Test backup by listing contents
    if PGPASSWORD="$DB_PASSWORD" pg_restore \
        --list \
        "$backup_path" > /dev/null 2>&1; then
        
        log "Backup integrity verified"
        return 0
    else
        error "Backup integrity check failed"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "bookswaps_backup_*.sql*" -type f -mtime +$RETENTION_DAYS -print0)
    
    if [ $deleted_count -gt 0 ]; then
        log "Deleted $deleted_count old backup(s)"
    else
        log "No old backups to delete"
    fi
}

# Upload to cloud storage (optional)
upload_to_cloud() {
    local backup_path="$BACKUP_DIR/$BACKUP_FILE"
    
    # Check if cloud upload is configured
    if [ -n "$CLOUD_STORAGE_BUCKET" ] && [ -n "$CLOUD_STORAGE_KEY" ]; then
        log "Uploading backup to cloud storage..."
        
        # Example for AWS S3 (uncomment and configure as needed)
        # aws s3 cp "$backup_path" "s3://$CLOUD_STORAGE_BUCKET/backups/"
        
        # Example for Google Cloud Storage (uncomment and configure as needed)
        # gsutil cp "$backup_path" "gs://$CLOUD_STORAGE_BUCKET/backups/"
        
        log "Cloud upload would be performed here (configure as needed)"
    else
        log "Cloud storage not configured, skipping upload"
    fi
}

# Send notification (optional)
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "$NOTIFICATION_WEBHOOK" ]; then
        log "Sending notification..."
        
        # Example webhook notification
        curl -X POST "$NOTIFICATION_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"BookSwaps Backup $status: $message\"}" \
            > /dev/null 2>&1 || warning "Failed to send notification"
    fi
}

# Main backup function
main() {
    log "Starting BookSwaps database backup..."
    log "Timestamp: $TIMESTAMP"
    
    # Check environment and prerequisites
    check_environment
    create_backup_dir
    test_connection
    
    # Create and verify backup
    if create_backup && verify_backup; then
        log "Backup completed successfully"
        
        # Optional: compress backup if using plain format
        # compress_backup
        
        # Cleanup old backups
        cleanup_old_backups
        
        # Optional: upload to cloud storage
        upload_to_cloud
        
        # Send success notification
        send_notification "SUCCESS" "Database backup completed successfully"
        
        log "Backup process completed"
        exit 0
    else
        error "Backup process failed"
        send_notification "FAILED" "Database backup failed"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "BookSwaps Database Backup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --test         Test database connection only"
        echo "  --cleanup      Clean old backups only"
        echo ""
        echo "Environment Variables:"
        echo "  DB_NAME        Database name (default: bookswaps)"
        echo "  DB_USER        Database user (default: postgres)"
        echo "  DB_PASSWORD    Database password (required)"
        echo "  DB_HOST        Database host (default: db)"
        echo "  DB_PORT        Database port (default: 5432)"
        echo "  RETENTION_DAYS Backup retention days (default: 30)"
        echo ""
        exit 0
        ;;
    --test)
        log "Testing database connection..."
        check_environment
        test_connection
        log "Connection test completed"
        exit 0
        ;;
    --cleanup)
        log "Cleaning up old backups..."
        create_backup_dir
        cleanup_old_backups
        log "Cleanup completed"
        exit 0
        ;;
    "")
        # No arguments, run main backup
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
