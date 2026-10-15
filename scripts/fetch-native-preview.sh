#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

version=0.4.0
sha256=4a1bcb3c6e77f2045397c80892e75e5eefb03b0f23bb11f4beafb3c7b57c9289
archive="davros-preview-v${version}-linux-amd64.tar.gz"
url="https://github.com/mnutt/davros-preview/releases/download/v${version}/${archive}"

if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
  echo 'Document previews require Linux amd64; build inside the Sandstorm VM.' >&2
  exit 1
fi
mkdir -p tmp output
stage="$(mktemp -d output/.native-preview-XXXXXX)"
trap 'rm -rf "$stage"' EXIT
verify() {
  printf '%s  %s\n' "$sha256" "$1" | sha256sum --check --status
}
if [[ ! -f "tmp/$archive" ]] || ! verify "tmp/$archive"; then
  curl --fail --location --retry 3 --connect-timeout 30 --max-time 300 \
    --output "$stage/$archive" "$url"
  verify "$stage/$archive"
  mv "$stage/$archive" "tmp/$archive"
fi
# Extract only after verification; keep the old installation until extraction succeeds.
tar --extract --gzip --file "tmp/$archive" --directory "$stage" --no-same-owner
for file in davros-preview fonts.conf VERSION licenses/DEPENDENCIES.txt licenses/Liberation.txt; do
  test -s "$stage/native-preview/$file"
done
test -x "$stage/native-preview/davros-preview"
test "$(cat "$stage/native-preview/VERSION")" = "$version"
# Replace the complete bundle, removing the obsolete two-binary installation.
rm -rf output/native-preview
mv "$stage/native-preview" output/native-preview
