#!/bin/sh
# Local updates keep the bundle identifier and data directory stable.
set -eu

[ "$(uname -s)" = Darwin ] || { echo "This installer requires macOS." >&2; exit 1; }
[ "$#" -le 1 ] || { echo "Usage: $0 [built-app-bundle]" >&2; exit 1; }

desktop="$(cd "$(dirname "$0")/.." && pwd)"
destination="/Applications/Nurb Fork.app"
identifier="io.github.babgev.nurb"

if [ "$#" -eq 0 ]; then
  cd "$desktop"
  npm run tauri build -- --bundles app --config '{"bundle":{"macOS":{"signingIdentity":"-"}}}'
  source_bundle="$desktop/src-tauri/target/release/bundle/macos/Nurb Fork.app"
else
  source_bundle="$1"
fi

validate_bundle() {
  bundle="$1"
  [ -d "$bundle" ] && [ ! -L "$bundle" ] || { echo "Not an app bundle: $bundle" >&2; exit 1; }
  actual_id=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$bundle/Contents/Info.plist")
  [ "$actual_id" = "$identifier" ] || { echo "Refusing to replace a different app: $actual_id" >&2; exit 1; }
  /usr/bin/codesign --verify --deep --strict "$bundle"
}

require_closed() {
  if /usr/bin/pgrep -f '^/Applications/Nurb Fork[.]app/Contents/MacOS/' >/dev/null; then
    echo "Quit Nurb Fork before installing. Your built update is ready at: $source_bundle" >&2
    echo "Then run: npm run install:mac -- \"$source_bundle\"" >&2
    exit 1
  fi
}

validate_bundle "$source_bundle"
require_closed
if [ -e "$destination" ] || [ -L "$destination" ]; then
  validate_bundle "$destination"
fi

staging=$(mktemp -d /Applications/.nurb-fork-install.XXXXXX)
backup=""
cleanup() {
  if [ -n "$backup" ] && [ -d "$backup" ] && [ ! -e "$destination" ]; then
    mv "$backup" "$destination" || echo "Restore the previous app from: $backup" >&2
  fi
  rm -rf "$staging"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

/usr/bin/ditto "$source_bundle" "$staging/Nurb Fork.app"
validate_bundle "$staging/Nurb Fork.app"
require_closed
if [ -d "$destination" ]; then
  backup_root="$HOME/Library/Caches/$identifier/app-backups"
  mkdir -p "$backup_root"
  backup_dir=$(mktemp -d "$backup_root/$(date +%Y%m%d-%H%M%S).XXXXXX")
  backup="$backup_dir/Nurb Fork.app"
  mv "$destination" "$backup"
fi
mv "$staging/Nurb Fork.app" "$destination"

echo "Installed $destination"
if [ -n "$backup" ]; then
  echo "Previous app saved at: $backup"
fi
echo "Projects, conversations, settings, and credentials are preserved. Open Nurb Fork when ready."
