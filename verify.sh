#!/usr/bin/env bash
set -euo pipefail
if [[ ! -f backup/MANIFEST.sha256 ]]; then
  echo "Missing backup/MANIFEST.sha256" >&2
  exit 1
fi
sha256sum -c backup/MANIFEST.sha256
