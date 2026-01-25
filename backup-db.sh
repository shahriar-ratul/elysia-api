#!/bin/bash

# Database Backup Script for Dokploy
# This script creates a backup of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/rest-api-backup-${TIMESTAMP}.sql"
CONTAINER_NAME="${CONTAINER_NAME:-rest-db}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-rest_api}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo_info "Starting database backup..."
echo_info "Container: $CONTAINER_NAME"
echo_info "Database: $POSTGRES_DB"
echo_info "Backup file: $BACKUP_FILE"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo_error "Container '$CONTAINER_NAME' is not running!"
    exit 1
fi

# Create backup
if docker exec "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_FILE"; then
    # Compress backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    echo_info "Backup completed successfully: $BACKUP_FILE"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo_info "Backup size: $SIZE"
    
    # Optional: Remove backups older than 30 days
    if [ -n "$CLEANUP_OLD_BACKUPS" ]; then
        echo_info "Cleaning up backups older than 30 days..."
        find "$BACKUP_DIR" -name "rest-api-backup-*.sql.gz" -mtime +30 -delete
        echo_info "Cleanup completed"
    fi
else
    echo_error "Backup failed!"
    exit 1
fi
