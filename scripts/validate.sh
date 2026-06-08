#!/usr/bin/env sh
# Top-level validation entry point.
#
# Runs:
#   1. scripts/smoke.sh        — every skill's SKILL.md is consumable
#   2. scripts/check-examples.sh — bad/good pairing and example hygiene
#
# Exits non-zero on the first failure. No external toolchains required.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

for f in README.md CONTRIBUTING.md LICENSE; do
    if [ ! -s "$f" ]; then
        echo "missing or empty: $f" >&2
        exit 1
    fi
done

./scripts/smoke.sh
./scripts/check-examples.sh

echo "validation passed"
