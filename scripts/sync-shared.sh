#!/bin/sh
# Copy the files in shared/ into every app. Each app is deployed from its own folder, so it
# cannot load a file from outside it; shared/ is the one place to edit.
# Usage: scripts/sync-shared.sh   (then bump the ?v= on the script tags that load a changed file)
set -eu
cd "$(dirname "$0")/.."
for app in portal apps/math-practice apps/one-stroke apps/piano-sightreader apps/little-writer; do
  cp shared/changelog-widget.js "$app/changelog-widget.js"
  echo "synced $app/changelog-widget.js"
done
