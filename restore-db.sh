#!/bin/bash

# Database Restore Script for Dokploy
# This script restores a PostgreSQL database from a backup file

set -e

# Configuration
BACKUP_FILE="${1}"
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

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
    echo_error "Usage: $0 <backup-file.sql[.gz]>"
    echo_info "Example: $0 backups/rest-api-backup-20240125_120000.sql.gz"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo_error "Container '$CONTAINER_NAME' is not running!"
    exit 1
fi

echo_warn "WARNING: This will replace all data in the database!"
echo_warn "Database: $POSTGRES_DB"
echo_warn "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo_info "Restore cancelled"
    exit 0
fi

echo_info "Starting database restore..."

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo_info "Decompressing backup file..."
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
    CLEANUP_TEMP=true
fi

# Restore database
if docker exec -i "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$BACKUP_FILE"; then
    echo_info "Database restored successfully!"
    
    # Cleanup temp file if created
    if [ "$CLEANUP_TEMP" = true ]; then
        rm "$TEMP_FILE"
    fi
else
    echo_error "Restore failed!"
    if [ "$CLEANUP_TEMP" = true ]; then
        rm "$TEMP_FILE"
    fi
    exit 1
fi
