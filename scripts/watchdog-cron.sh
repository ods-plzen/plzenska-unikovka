#!/usr/bin/env bash
# Watchdog: hlídá, jestli GH Actions cron updatuje data alespoň 1x za 25 h.
# Pokud poslední "data: aktualizace…" commit je starší → NTFY + auto-trigger
# workflow přes `gh`.
#
# Spouští se přes launchd každou hodinu (viz launchd/com.uhumdrum.plzen-prehledne.watchdog.plist).

set -euo pipefail

REPO_DIR="/Users/tadytudy/Desktop/plzen-prehledne"
SCRAPER_DIR="/Users/tadytudy/Desktop/plzenaci-scraper"
LOG="/Users/tadytudy/Desktop/plzen-prehledne/scripts/watchdog.log"
THRESHOLD_HOURS=25

# Načti NTFY_TOPIC z .env scraperu (sdílíme stejný topic)
if [[ -f "$SCRAPER_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRAPER_DIR/.env"
  set +a
fi

cd "$REPO_DIR"
NOW_TS="$(date '+%Y-%m-%d %H:%M:%S')"

# Refresh origin
/usr/bin/git fetch origin --quiet 2>>"$LOG" || {
  echo "[$NOW_TS] ⚠ git fetch failed" >> "$LOG"
  exit 0
}

# Najdi nejnovější data-update commit
LAST_DATA_COMMIT=$(/usr/bin/git log origin/main \
  --grep "^data: aktualizace" \
  --format="%H %at %s" -1)

if [[ -z "$LAST_DATA_COMMIT" ]]; then
  echo "[$NOW_TS] ⚠ žádný data commit nenalezen" >> "$LOG"
  exit 0
fi

COMMIT_TS=$(echo "$LAST_DATA_COMMIT" | awk '{print $2}')
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - COMMIT_TS) / 3600 ))

echo "[$NOW_TS] last data commit: $((NOW_EPOCH - COMMIT_TS))s = ${AGE_HOURS}h ago" >> "$LOG"

if [[ "$AGE_HOURS" -le "$THRESHOLD_HOURS" ]]; then
  exit 0
fi

# STALE — notifikuj + auto-trigger
MSG="⚠️ Plzeňská únikovka — data nevyaktualizovaná ${AGE_HOURS}h.
Last commit: $(echo "$LAST_DATA_COMMIT" | cut -d' ' -f3-)
Triggeruji workflow ručně."

if [[ -n "${NTFY_TOPIC:-}" ]]; then
  /usr/bin/curl -fsS \
    -H "Title: Plzeňská únikovka — cron skip" \
    -H "Priority: high" \
    -d "$MSG" \
    "https://ntfy.sh/${NTFY_TOPIC}" >> "$LOG" 2>&1 || true
fi

# Auto-trigger GitHub Actions
if command -v /opt/homebrew/bin/gh >/dev/null 2>&1; then
  GH_BIN=/opt/homebrew/bin/gh
elif command -v gh >/dev/null 2>&1; then
  GH_BIN=$(command -v gh)
else
  echo "[$NOW_TS] ⚠ gh CLI nenalezen, manual trigger nelze" >> "$LOG"
  exit 0
fi

"$GH_BIN" workflow run update.yml -R fuckupic/plzen-prehledne >> "$LOG" 2>&1 && {
  echo "[$NOW_TS] ✓ workflow dispatched" >> "$LOG"
}
