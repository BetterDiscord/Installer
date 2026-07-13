#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "Universal macOS builds must run on macOS." >&2
    exit 1
fi

for command in codesign ditto lipo; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Required command not found: $command" >&2
        exit 1
    fi
done

WAILS_BIN="${WAILS_BIN:-wails}"
if ! command -v "$WAILS_BIN" >/dev/null 2>&1; then
    echo "Wails CLI not found: $WAILS_BIN" >&2
    exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$ROOT_DIR/build/bin/BetterDiscord Installer.app"
EXECUTABLE_NAME="BetterDiscord-Installer"
EXECUTABLE_PATH="$APP_PATH/Contents/MacOS/$EXECUTABLE_NAME"
ZIP_PATH="$ROOT_DIR/build/bin/BetterDiscord-Mac.zip"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

cd "$ROOT_DIR"

"$WAILS_BIN" build -platform darwin/amd64 -clean "$@"
if [[ "$(lipo -archs "$EXECUTABLE_PATH")" != "x86_64" ]]; then
    echo "Expected an x86_64 build at $EXECUTABLE_PATH" >&2
    exit 1
fi
ditto "$APP_PATH" "$TEMP_DIR/amd64.app"

"$WAILS_BIN" build -platform darwin/arm64 -s "$@"
if [[ "$(lipo -archs "$EXECUTABLE_PATH")" != "arm64" ]]; then
    echo "Expected an arm64 build at $EXECUTABLE_PATH" >&2
    exit 1
fi

lipo -create \
    "$TEMP_DIR/amd64.app/Contents/MacOS/$EXECUTABLE_NAME" \
    "$EXECUTABLE_PATH" \
    -output "$TEMP_DIR/$EXECUTABLE_NAME"
mv "$TEMP_DIR/$EXECUTABLE_NAME" "$EXECUTABLE_PATH"
chmod 755 "$EXECUTABLE_PATH"

ARCHS="$(lipo -archs "$EXECUTABLE_PATH")"
if [[ " $ARCHS " != *" x86_64 "* || " $ARCHS " != *" arm64 "* ]]; then
    echo "Universal binary verification failed: $ARCHS" >&2
    exit 1
fi

CODESIGN_IDENTITY="${CODESIGN_IDENTITY:--}"
codesign --force --deep --sign "$CODESIGN_IDENTITY" "$APP_PATH"
codesign --verify --deep --strict "$APP_PATH"

rm -f "$ZIP_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ZIP_PATH"

echo "Created $ZIP_PATH ($ARCHS)"
