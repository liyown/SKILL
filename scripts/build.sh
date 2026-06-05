#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

./scripts/validate.sh

NAME=$(node -e 'process.stdout.write(require("./manifest.json").name)')
VERSION=$(node -e 'process.stdout.write(require("./manifest.json").version)')
DIST="$ROOT/dist"
PACKAGE_DIR="$DIST/$NAME-$VERSION"

rm -rf "$PACKAGE_DIR"
rm -f "$DIST/$NAME-$VERSION.tar.gz" "$DIST/$NAME-$VERSION.zip" "$DIST/SHA256SUMS"
mkdir -p "$PACKAGE_DIR"

for path in \
  SKILL.md \
  skill.md \
  manifest.json \
  README.md \
  LICENSE \
  agents \
  examples \
  prompts
do
  cp -R "$path" "$PACKAGE_DIR/"
done

tar -czf "$DIST/$NAME-$VERSION.tar.gz" -C "$DIST" "$NAME-$VERSION"

if command -v zip >/dev/null 2>&1; then
  (cd "$DIST" && zip -qr "$NAME-$VERSION.zip" "$NAME-$VERSION")
fi

(
  cd "$DIST"
  files="$NAME-$VERSION.tar.gz"
  if [ -f "$NAME-$VERSION.zip" ]; then
    files="$files $NAME-$VERSION.zip"
  fi

  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum $files > SHA256SUMS
  else
    shasum -a 256 $files > SHA256SUMS
  fi
)

echo "built artifacts in $DIST"
