#!/bin/sh
# Pull the latest code, rebuild and restart the site. Runs on the server as root:
#   sudo /opt/safar/deploy/update.sh
# The GitHub Actions workflow calls it on every push; you can also run it by hand.
set -e
APP_DIR=/opt/safar
cd "$APP_DIR"
sudo -u safar git pull --ff-only
sudo -u safar pnpm install --frozen-lockfile
sudo -u safar pnpm build
systemctl restart safar
systemctl is-active --quiet safar && echo "Safar updated and running."
