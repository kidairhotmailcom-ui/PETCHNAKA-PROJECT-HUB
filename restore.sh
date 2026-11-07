#!/usr/bin/env bash
set -euo pipefail
echo "Use GitHub Actions > Restore Backup To Test Branch."
echo "Restore is deliberately limited to a separate restore-test branch."
echo "Do not merge to the production branch until the restored project is reviewed and tested."
