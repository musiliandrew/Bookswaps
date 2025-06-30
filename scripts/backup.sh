#!/bin/bash

# BookSwaps Backup Script
# Automated backup for database, media files, and configurations

set -e

# Configuration
BACKUP_DIR="/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
POSTGRES_HOST="postgres"
POSTGRES_DB=${POSTGRES_DB:-bookswaps}
POSTGRES_USER=${POSTGRES_USER:-bookswaps}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[BACKUP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory structure
create_backup_structure() {
    mkdir -p $BACKUP_DIR/database
    mkdir -p $BACKUP_DIR/media
    mkdir -p $BACKUP_DIR/configs
}

# Backup PostgreSQL database
backup_database() {
    log_info "Starting database backup..."
    
    local backup_file="$BACKUP_DIR/database/bookswaps_db_$TIMESTAMP.sql"
    
    # Create database dump
    pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > $backup_file
    
    # Compress the backup
    gzip $backup_file
    
    log_info "Database backup completed: ${backup_file}.gz"
}

# Backup media files
backup_media() {
    log_info "Starting media files backup..."
    
    local media_backup="$BACKUP_DIR/media/media_files_$TIMESTAMP.tar.gz"
    
    if [ -d "/app/media" ]; then
        tar -czf $media_backup -C /app media/
        log_info "Media files backup completed: $media_backup"
    else
        log_warning "Media directory not found, skipping media backup"
    fi
}

# Backup configuration files
backup_configs() {
    log_info "Starting configuration backup..."
    
    local config_backup="$BACKUP_DIR/configs/configs_$TIMESTAMP.tar.gz"
    
    # Create temporary directory for configs
    local temp_dir="/tmp/bookswaps_configs_$TIMESTAMP"
    mkdir -p $temp_dir
    
    # Copy important configuration files (if they exist)
    [ -f "/app/docker-compose.prod.yml" ] && cp /app/docker-compose.prod.yml $temp_dir/
    [ -f "/app/.env.production" ] && cp /app/.env.production $temp_dir/
    [ -d "/app/nginx" ] && cp -r /app/nginx $temp_dir/
    
    # Create archive
    if [ "$(ls -A $temp_dir)" ]; then
        tar -czf $config_backup -C $temp_dir .
        log_info "Configuration backup completed: $config_backup"
    else
        log_warning "No configuration files found to backup"
    fi
    
    # Cleanup
    rm -rf $temp_dir
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [ -n "$BACKUP_S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
        log_info "Uploading backups to S3..."
        
        # Install AWS CLI if not present
        if ! command -v aws &> /dev/null; then
            log_info "Installing AWS CLI..."
            apk add --no-cache aws-cli
        fi
        
        # Upload database backup
        aws s3 cp $BACKUP_DIR/database/ s3://$BACKUP_S3_BUCKET/bookswaps/database/ --recursive --exclude "*" --include "*$TIMESTAMP*"
        
        # Upload media backup
        aws s3 cp $BACKUP_DIR/media/ s3://$BACKUP_S3_BUCKET/bookswaps/media/ --recursive --exclude "*" --include "*$TIMESTAMP*"
        
        # Upload config backup
        aws s3 cp $BACKUP_DIR/configs/ s3://$BACKUP_S3_BUCKET/bookswaps/configs/ --recursive --exclude "*" --include "*$TIMESTAMP*"
        
        log_info "S3 upload completed"
    else
        log_info "S3 configuration not found, skipping cloud backup"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Clean database backups
    find $BACKUP_DIR/database -name "*.gz" -mtime +$RETENTION_DAYS -delete
    
    # Clean media backups
    find $BACKUP_DIR/media -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    # Clean config backups
    find $BACKUP_DIR/configs -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    log_info "Old backups cleaned up"
}

# Generate backup report
generate_report() {
    local report_file="$BACKUP_DIR/backup_report_$TIMESTAMP.txt"
    
    cat > $report_file << EOF
BookSwaps Backup Report
======================
Date: $(date)
Timestamp: $TIMESTAMP

Database Backup:
$(ls -lh $BACKUP_DIR/database/*$TIMESTAMP* 2>/dev/null || echo "No database backup found")

Media Backup:
$(ls -lh $BACKUP_DIR/media/*$TIMESTAMP* 2>/dev/null || echo "No media backup found")

Configuration Backup:
$(ls -lh $BACKUP_DIR/configs/*$TIMESTAMP* 2>/dev/null || echo "No configuration backup found")

Disk Usage:
$(df -h $BACKUP_DIR)

Total Backup Size:
$(du -sh $BACKUP_DIR)
EOF
    
    log_info "Backup report generated: $report_file"
}

# Verify backups
verify_backups() {
    log_info "Verifying backup integrity..."
    
    local errors=0
    
    # Verify database backup
    if [ -f "$BACKUP_DIR/database/bookswaps_db_$TIMESTAMP.sql.gz" ]; then
        if gzip -t "$BACKUP_DIR/database/bookswaps_db_$TIMESTAMP.sql.gz"; then
            log_info "Database backup integrity: OK"
        else
            log_error "Database backup integrity: FAILED"
            errors=$((errors + 1))
        fi
    fi
    
    # Verify media backup
    if [ -f "$BACKUP_DIR/media/media_files_$TIMESTAMP.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/media/media_files_$TIMESTAMP.tar.gz" > /dev/null; then
            log_info "Media backup integrity: OK"
        else
            log_error "Media backup integrity: FAILED"
            errors=$((errors + 1))
        fi
    fi
    
    # Verify config backup
    if [ -f "$BACKUP_DIR/configs/configs_$TIMESTAMP.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/configs/configs_$TIMESTAMP.tar.gz" > /dev/null; then
            log_info "Configuration backup integrity: OK"
        else
            log_error "Configuration backup integrity: FAILED"
            errors=$((errors + 1))
        fi
    fi
    
    if [ $errors -eq 0 ]; then
        log_info "All backups verified successfully"
    else
        log_error "$errors backup(s) failed verification"
        exit 1
    fi
}

# Send notification (if configured)
send_notification() {
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local status="success"
        local color="good"
        
        if [ $? -ne 0 ]; then
            status="failed"
            color="danger"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"title\":\"BookSwaps Backup $status\",\"text\":\"Backup completed at $(date)\",\"fields\":[{\"title\":\"Timestamp\",\"value\":\"$TIMESTAMP\",\"short\":true}]}]}" \
            $SLACK_WEBHOOK_URL
    fi
}

# Main backup process
main() {
    log_info "Starting BookSwaps backup process..."
    
    create_backup_structure
    backup_database
    backup_media
    backup_configs
    verify_backups
    upload_to_s3
    cleanup_old_backups
    generate_report
    send_notification
    
    log_info "Backup process completed successfully!"
}

# Handle errors
trap 'log_error "Backup failed at line $LINENO"; send_notification; exit 1' ERR

# Run main function
main "$@"
