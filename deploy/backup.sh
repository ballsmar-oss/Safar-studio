#!/bin/sh
# Daily backup of the database and uploaded files. Add to cron:
#   0 3 * * * /opt/safar/deploy/backup.sh
set -e
DATA_DIR=${DATA_DIR:-/var/lib/safar}
DEST=${BACKUP_DIR:-/var/backups/safar}
STAMP=$(date +%Y-%m-%d)
mkdir -p "$DEST"
sqlite3 "$DATA_DIR/safar.db" ".backup '$DEST/safar-$STAMP.db'"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$DATA_DIR" uploads
find "$DEST" -type f -mtime +14 -delete
