#!/bin/sh
# Assembles and ad-hoc signs the macOS .app bundle that GoReleaser archives.
# Usage: bundle-macos-app.sh <version>
#
# GoReleaser builds the .app purely by file placement: universal_binaries puts
# the binary at <bundle>/Contents/MacOS/, and the archive adds Info.plist and
# the icon on the way into the zip. Nothing ever hands the assembled bundle to
# codesign, so releases shipped with `Sealed Resources=none`, `Info.plist=not
# bound`, and the Go linker's default `a.out` signing identity instead of the
# bundle's CFBundleIdentifier.
#
# macOS keys App Management (kTCCServiceSystemPolicyAppBundles) approvals to a
# code signature it re-validates on later launches. An unsealed bundle fails
# that check, so TCC discards the grant — the user approves it, the toggle
# flips itself back off, and injecting into Discord.app keeps getting denied
# (BetterDiscord/Installer#424). Ad-hoc signing needs no Apple account and no
# secrets, and is enough to make the grant stick.
set -eu

cd "$(dirname "$0")/.."

VERSION="${1:?version required}"

# Info.plist is a template (__VERSION__) so the bundle reports the release
# version; render it before it goes into the bundle, since codesign seals it.
mkdir -p dist/darwin
sed "s|__VERSION__|${VERSION}|g" build/darwin/Info.release.plist > dist/darwin/Info.plist

# GoReleaser decides where under dist/ the universal binary lands, so locate the
# bundle rather than hardcoding its internal layout. Exclude the staging tree
# below, which deliberately has no .app suffix but is still under dist/.
APP=$(find dist -type d -name "*.app" -print | head -n 1)
if [ -z "$APP" ]; then
    echo "bundle-macos-app.sh: no .app bundle found under dist/" >&2
    exit 1
fi
echo "📦 Bundling $APP"

# Populate the bundle so codesign sees a real app: a sealed bundle needs its
# Info.plist and resources present at signing time, not injected afterwards.
cp dist/darwin/Info.plist "$APP/Contents/Info.plist"
mkdir -p "$APP/Contents/Resources"
cp build/darwin/icon.icns "$APP/Contents/Resources/iconfile.icns"

# Sign in place: codesign rewrites the main executable, and that executable is
# the artifact the archive picks up. Signing a copy would leave the zip holding
# an unsigned binary alongside a seal computed over the signed one.
#
# No --deep (Apple discourages it and there are no nested bundles) and no
# --options runtime (hardened runtime buys nothing without notarization and
# only adds ways for an unnotarized build to fail). The identifier comes from
# CFBundleIdentifier now that Info.plist is in place.
echo "🔏 Ad-hoc signing $APP"
codesign --force --sign - "$APP"
codesign --verify --strict --verbose=2 "$APP"
codesign --display --verbose=4 "$APP" 2>&1 | grep -E "^(Identifier|CodeDirectory|Sealed|Signature)" || true

# Stage the sealed non-executable files at a stable path for the archive's
# `files:` entries. codesign only rewrites the executable, so these are
# byte-identical to what the seal covers; the executable itself reaches the
# archive as GoReleaser's own (now signed) binary artifact.
SEALED=dist/darwin/sealed
rm -rf "$SEALED"
mkdir -p "$SEALED/Contents/Resources" "$SEALED/Contents/_CodeSignature"
cp "$APP/Contents/Info.plist" "$SEALED/Contents/Info.plist"
cp "$APP/Contents/Resources/iconfile.icns" "$SEALED/Contents/Resources/iconfile.icns"
cp "$APP/Contents/_CodeSignature/CodeResources" "$SEALED/Contents/_CodeSignature/CodeResources"

echo "✅ macOS bundle assembled and ad-hoc signed"
