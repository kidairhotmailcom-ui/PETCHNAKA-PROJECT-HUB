#!/usr/bin/env bash
# Helper for local/manual backup preparation. The scheduled GitHub workflow is authoritative.
set -euo pipefail
echo "Run the GitHub Actions workflow: Project Backup."
echo "Never add .env files, passwords, API keys, or service-role secrets to Git."
