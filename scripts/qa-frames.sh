#!/usr/bin/env bash
# Extract QA frames from every rendered series film so a human (or an agent
# with vision) can LOOK at them before shipping. Layout collisions only show
# up in pixels — never ship a render nobody looked at.
# Usage: ./scripts/qa-frames.sh [frame1 frame2 ...]   (defaults: 140 320)
set -euo pipefail
cd "$(dirname "$0")/.."
frames=("${@:-140 320}")
[ $# -eq 0 ] && frames=(140 320)
mkdir -p out/qa
for f in out/series/*.mp4; do
  name=$(basename "$f" .mp4)
  for n in "${frames[@]}"; do
    ffmpeg -loglevel error -i "$f" -vf "select=eq(n\,$n)" -vframes 1 "out/qa/$name-$n.png" -y
  done
done
echo "── QA frames in out/qa/ — open them and actually look:"
ls out/qa/
