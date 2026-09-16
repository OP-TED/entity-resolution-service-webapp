#!/bin/sh
# Render the runtime application config served at /config.json.
#
# Runs before 20-envsubst-on-templates.sh; output goes to /tmp so the image keeps
# working with a read-only root filesystem.
#
# Ranges Boundaries: low is 0..LOW_MAX, medium is
# LOW_MAX..MEDIUM_MAX, high is MEDIUM_MAX..1 — so the ranges are contiguous by
# construction and the top level needs no maximum.
set -eu

OUT_DIR="${APP_CONFIG_OUTPUT_DIR:-/tmp/appconfig}"
OUT_FILE="$OUT_DIR/config.json"

LOW_MAX="${SCORE_LEVEL_LOW_MAX:-0.4}"
MEDIUM_MAX="${SCORE_LEVEL_MEDIUM_MAX:-0.7}"

mkdir -p "$OUT_DIR"

cat > "$OUT_FILE" <<JSON
{
  "scoreLevels": {
    "lowMax": $LOW_MAX,
    "mediumMax": $MEDIUM_MAX
  }
}
JSON

echo "16-render-app-config.sh: wrote $OUT_FILE (low < $LOW_MAX <= medium < $MEDIUM_MAX <= high)"
