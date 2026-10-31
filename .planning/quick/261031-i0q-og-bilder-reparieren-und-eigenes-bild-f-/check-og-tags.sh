#!/usr/bin/env bash
# Render-Check fuer og:image / twitter:image. Aufruf aus dem Repo-Root:
#   bash check-og-tags.sh /warum=/opengraph-image.jpg tag:/schreib-merz=/schreib-merz/opengraph-image
# Paare route=erwartet. Praefix "tag:" prueft nur den Tag, nicht die Bild-URL.
# Voraussetzung: web/.next ist gebaut (npm --prefix web run build).
# Startet next start auf Port 3457 und beendet den Listener bei jedem Ausgang.

PORT=3457
BASE="http://localhost:${PORT}"
PROD="https://www.brief-nach-berlin.de"

if lsof -iTCP:${PORT} -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  echo "ABORT: Port ${PORT} ist belegt" >&2
  exit 2
fi

LOG="$(mktemp -t og-check-server.XXXXXX)"
cleanup() {
  PIDS="$(lsof -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null)"
  [ -n "$PIDS" ] && kill $PIDS 2>/dev/null
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null
  rm -f "$LOG"
}
trap cleanup EXIT

npm --prefix web run start -- -p ${PORT} >"$LOG" 2>&1 &
SERVER_PID=$!

if ! curl -s -o /dev/null --retry 40 --retry-connrefused --retry-delay 1 "${BASE}/"; then
  echo "ABORT: Server startet nicht" >&2
  cat "$LOG" >&2
  exit 2
fi

FAILS=0
meta_value() {
  # $1 = HTML, $2 = Attributname (property|name), $3 = Wert
  printf '%s' "$1" | tr '\n' ' ' | grep -o "<meta[^>]*$2=\"$3\"[^>]*>" | head -1 \
    | sed -E 's/.*content="([^"]*)".*/\1/'
}

for pair in "$@"; do
  tag_only=0
  case "$pair" in tag:*) tag_only=1; pair="${pair#tag:}";; esac
  route="${pair%%=*}"
  expected="${pair#*=}"
  html="$(curl -s -A "facebookexternalhit/1.1" "${BASE}${route}")"
  og="$(meta_value "$html" property og:image)"
  tw="$(meta_value "$html" name twitter:image)"
  ok=1
  case "$og" in *"$expected"*) ;; *) ok=0;; esac
  case "$tw" in *"$expected"*) ;; *) ok=0;; esac
  status="-"
  ctype="-"
  if [ "$ok" = 1 ] && [ "$tag_only" = 0 ]; then
    url="$(printf '%s' "$og" | sed "s#${PROD}#${BASE}#")"
    out="$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$url")"
    status="${out%% *}"
    ctype="${out#* }"
    [ "$status" = "200" ] || ok=0
    case "$ctype" in image/*) ;; *) ok=0;; esac
  fi
  if [ "$ok" = 1 ]; then res=PASS; else res=FAIL; FAILS=$((FAILS+1)); fi
  echo "${res} ${route} og=${og:-MISSING} tw=${tw:-MISSING} fetch=${status} ${ctype}"
done

[ "$FAILS" = 0 ] && exit 0 || exit 1
