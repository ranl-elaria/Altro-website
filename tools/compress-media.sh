#!/usr/bin/env bash
# Media compressor for public/ — GIF→WebM/MP4, MP4→web-optimized
# Output goes to public/optimized/; originals untouched.
# Usage: bash tools/compress-media.sh

set -e
IN="public"
OUT="public/optimized"
mkdir -p "$OUT"

# ---- MP4 → web-optimized MP4 (H.264, ~1.5Mbps, 1080p max, no audio) + WebM ----
for f in "$IN"/*.mp4; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .mp4)
  echo "→ MP4: $name"

  ffmpeg -y -i "$f" \
    -c:v libx264 -crf 28 -preset slow -profile:v main -pix_fmt yuv420p \
    -vf "scale='min(1920,iw)':-2,fps=30" \
    -movflags +faststart -an \
    "$OUT/$name.mp4" -loglevel error

  ffmpeg -y -i "$f" \
    -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 \
    -vf "scale='min(1920,iw)':-2,fps=30" \
    -an \
    "$OUT/$name.webm" -loglevel error
done

# ---- GIF → MP4 + WebM (drop GIF entirely) ----
for f in "$IN"/*.gif; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .gif)
  echo "→ GIF: $name"

  ffmpeg -y -i "$f" \
    -movflags +faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=24" \
    -c:v libx264 -crf 26 -preset slow -an \
    "$OUT/$name.mp4" -loglevel error

  ffmpeg -y -i "$f" \
    -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=24" \
    -an \
    "$OUT/$name.webm" -loglevel error
done

echo
echo "=== BEFORE ==="
du -sh "$IN"/*.mp4 "$IN"/*.gif 2>/dev/null | sort -rh
echo
echo "=== AFTER ==="
du -sh "$OUT"/* | sort -rh
echo
echo "Done. Review public/optimized/ then swap references in code."
