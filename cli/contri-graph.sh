#!/usr/bin/env bash
# contri-graph — Show GitHub contribution graph in your terminal
# Usage: bash contri-graph.sh [--user USERNAME] [--year YEAR] [--color COLOR] [--compact]
# Or set CONTRI_GRAPH_USER env var and just run: bash contri-graph.sh

set -euo pipefail

API_BASE="https://cg.nitishk.dev/api/github"
CACHE_DIR="/tmp/contri-graph-cache"
CACHE_TTL=14400  # 4 hours in seconds

USER="${CONTRI_GRAPH_USER:-}"
YEAR="$(date +%Y)"
COLOR="green"
COMPACT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user)    USER="$2"; shift 2 ;;
    --year)    YEAR="$2"; shift 2 ;;
    --color)   COLOR="$2"; shift 2 ;;
    --compact) COMPACT="true"; shift ;;
    --help|-h)
      echo "Usage: contri-graph [--user USERNAME] [--year YEAR] [--color COLOR] [--compact]"
      echo ""
      echo "Options:"
      echo "  --user     GitHub username (or set CONTRI_GRAPH_USER env var)"
      echo "  --year     Year to display (default: current year)"
      echo "  --color    Color theme: green, blue, purple, orange, yellow, pink, cyan, white"
      echo "  --compact  Show condensed 3-row graph"
      echo ""
      echo "Shell setup (add to your .bashrc/.zshrc/config.fish):"
      echo "  export CONTRI_GRAPH_USER=\"your-username\""
      echo "  bash /path/to/contri-graph.sh"
      exit 0
      ;;
    *)
      if [[ -z "$USER" ]]; then
        USER="$1"
      fi
      shift
      ;;
  esac
done

if [[ -z "$USER" ]]; then
  echo "Error: No username provided. Use --user USERNAME or set CONTRI_GRAPH_USER env var."
  exit 1
fi

mkdir -p "$CACHE_DIR"
CACHE_FILE="${CACHE_DIR}/${USER}-${YEAR}-${COLOR}-${COMPACT:-full}"

if [[ -f "$CACHE_FILE" ]]; then
  CACHE_AGE=$(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null) ))
  if [[ "$CACHE_AGE" -lt "$CACHE_TTL" ]]; then
    cat "$CACHE_FILE"
    exit 0
  fi
fi

URL="${API_BASE}/${USER}/terminal?year=${YEAR}&color=${COLOR}"
if [[ -n "$COMPACT" ]]; then
  URL="${URL}&compact=true"
fi

RESPONSE=$(curl -sf "$URL" 2>/dev/null) || {
  if [[ -f "$CACHE_FILE" ]]; then
    cat "$CACHE_FILE"
    exit 0
  fi
  echo "Failed to fetch contribution graph for @${USER}"
  exit 1
}

echo "$RESPONSE" > "$CACHE_FILE"
echo "$RESPONSE"
