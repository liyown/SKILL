#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

./scripts/validate.sh

NAME=$(node -e 'process.stdout.write(require("./package.json").name)')
VERSION=$(node -e 'process.stdout.write(require("./package.json").version)')
DIST="$ROOT/dist"
PACKAGE_DIR="$DIST/$NAME-$VERSION"

rm -rf "$DIST"
mkdir -p "$DIST/items" "$PACKAGE_DIR"

node scripts/validate-registry.mjs --write-dist

for path in \
  registry.json \
  README.md \
  LICENSE \
  package.json \
  docs \
  skills \
  scripts \
  .github
do
  cp -R "$path" "$PACKAGE_DIR/"
done

tar -czf "$DIST/$NAME-$VERSION.tar.gz" -C "$DIST" "$NAME-$VERSION"

if command -v zip >/dev/null 2>&1; then
  (cd "$DIST" && zip -qr "$NAME-$VERSION.zip" "$NAME-$VERSION")
fi

(
  cd "$DIST"
  files="$NAME-$VERSION.tar.gz registry.json"
  if [ -f "$NAME-$VERSION.zip" ]; then
    files="$files $NAME-$VERSION.zip"
  fi

  for item in items/*.json; do
    files="$files $item"
  done

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum $files > SHA256SUMS
  else
    shasum -a 256 $files > SHA256SUMS
  fi
)

echo "built artifacts in $DIST"
