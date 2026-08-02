#!/usr/bin/env bash
# Render a film series sequentially: ./scripts/render-series.sh Film1 Film2 ...
# Films land in out/series/. Sequential on purpose — parallel renders fight
# over CPU and finish slower in aggregate.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/series
for comp in "$@"; do
  echo "── rendering $comp"
  npx remotion render src/index.ts "$comp" "out/series/$comp.mp4" --log=error --overwrite
done
echo "── done:"
ls -la out/series/
