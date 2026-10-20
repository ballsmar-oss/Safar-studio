#!/bin/sh
# Checks GitHub for new commits and updates the site when there are any. Add to cron on the server:
#   */5 * * * * root /opt/safar/deploy/auto-update.sh
set -e
BRANCH=claude/new-session-shi79n
cd /opt/safar
sudo -u safar git fetch -q origin "$BRANCH"
LOCAL=$(sudo -u safar git rev-parse HEAD)
REMOTE=$(sudo -u safar git rev-parse "origin/$BRANCH")
if [ "$LOCAL" != "$REMOTE" ]; then
  /opt/safar/deploy/update.sh
fi
