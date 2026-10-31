#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Sprint 11 - Fullstack pipeline smoke test
#
# Drives the live API exactly the way the React SPA does:
#   GET list -> POST JSON -> POST multipart -> GET one -> DELETE -> GET 404
# and audits the CORS preflight policy.
#
# Usage: bash scripts/smoke-test.sh [http://localhost:5000]
# ---------------------------------------------------------------------------
set -uo pipefail

BASE_URL="${1:-http://localhost:5000}"
TMP_DIR="$(mktemp -d)"
PASS=0
FAIL=0

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

c_ok()   { printf '\033[0;32m  PASS\033[0m %s\n' "$1"; PASS=$((PASS + 1)); }
c_bad()  { printf '\033[0;31m  FAIL\033[0m %s\n' "$1"; FAIL=$((FAIL + 1)); }
step()   { printf '\n\033[1;36m▸ %s\033[0m\n' "$1"; }

assert_eq() {
  if [[ "$2" == "$3" ]]; then c_ok "$1 ($2)"; else c_bad "$1 — expected '$3', got '$2'"; fi
}

json_get() {
  node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const value = process.argv[2].split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), data);
    console.log(value === undefined || value === null ? "" : String(value));
  ' "$1" "$2"
}

request() { # request METHOD PATH [extra curl args...] -> stdout: HTTP status, body at $TMP_DIR/body.json
  local method="$1"; shift
  local path="$1"; shift
  curl -sS -o "$TMP_DIR/body.json" -w '%{http_code}' -X "$method" "$BASE_URL$path" "$@"
}

echo "=============================================================="
echo " Sprint 11 smoke test  →  $BASE_URL"
echo "=============================================================="

step "0. Service health"
STATUS=$(request GET /api/health)
assert_eq "GET /api/health returns 200" "$STATUS" "200"
echo "      database: $(json_get "$TMP_DIR/body.json" database)   assets: $(json_get "$TMP_DIR/body.json" assetStorage)"

step "1. GET /api/posts (React useEffect hydration path)"
STATUS=$(request GET /api/posts)
assert_eq "GET /api/posts returns 200" "$STATUS" "200"
INITIAL_COUNT=$(json_get "$TMP_DIR/body.json" count)
echo "      existing documents: $INITIAL_COUNT"

step "2. POST /api/posts as application/json"
STATUS=$(request POST /api/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Smoke test: JSON payload","body":"Injected by scripts/smoke-test.sh","author":"CI Runner"}')
assert_eq "POST json returns 201" "$STATUS" "201"
JSON_ID=$(json_get "$TMP_DIR/body.json" data.id)
[[ -n "$JSON_ID" ]] && c_ok "document created with id $JSON_ID" || c_bad "no id returned"

step "3. POST /api/posts as multipart/form-data (FormData + multer)"
SAMPLE_IMAGE="scripts/sample-thumb.png"
if [[ -f "$SAMPLE_IMAGE" ]]; then
  STATUS=$(request POST /api/posts \
    -F "title=Smoke test: multipart payload" \
    -F "body=Thumbnail streamed through multer to the asset provider." \
    -F "author=CI Runner" \
    -F "image=@${SAMPLE_IMAGE};type=image/png")
  assert_eq "POST multipart returns 201" "$STATUS" "201"
  IMAGE_URL=$(json_get "$TMP_DIR/body.json" data.imageUrl)
  FILE_ID=$(json_get "$TMP_DIR/body.json" data.id)
  PROVIDER=$(json_get "$TMP_DIR/body.json" data.storageProvider)
  [[ -n "$IMAGE_URL" ]] && c_ok "asset URL persisted in Mongo: $IMAGE_URL" || c_bad "imageUrl empty"
  echo "      storage provider: $PROVIDER"
  if [[ "$PROVIDER" == "local" ]]; then
    ASSET_STATUS=$(curl -sS -o /dev/null -w '%{http_code}' "$IMAGE_URL")
    assert_eq "stored asset is publicly retrievable" "$ASSET_STATUS" "200"
  fi
else
  c_bad "sample image $SAMPLE_IMAGE missing"
fi

step "4. GET /api/posts/:id"
STATUS=$(request GET "/api/posts/$JSON_ID")
assert_eq "GET single post returns 200" "$STATUS" "200"
assert_eq "title round-trips through the DB" "$(json_get "$TMP_DIR/body.json" data.title)" "Smoke test: JSON payload"

step "5. Validation + error boundaries"
STATUS=$(request POST /api/posts -H 'Content-Type: application/json' -d '{"body":"missing title"}')
assert_eq "POST without title returns 400" "$STATUS" "400"
echo "      message: $(json_get "$TMP_DIR/body.json" message)"
STATUS=$(request GET "/api/posts/000000000000000000000000")
assert_eq "GET unknown id returns 404" "$STATUS" "404"

step "6. DELETE /api/posts/:id and confirm removal"
STATUS=$(request DELETE "/api/posts/$JSON_ID")
assert_eq "DELETE returns 200" "$STATUS" "200"
STATUS=$(request GET "/api/posts/$JSON_ID")
assert_eq "deleted document is gone (404)" "$STATUS" "404"
if [[ -n "${FILE_ID:-}" ]]; then
  request DELETE "/api/posts/$FILE_ID" >/dev/null
fi

step "7. CORS policy audit"
ALLOWED=$(curl -sS -D - -o /dev/null -X OPTIONS \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type' \
  "$BASE_URL/api/posts" | tr -d '\r' | grep -i '^access-control-allow-origin' || true)
[[ -n "$ALLOWED" ]] && c_ok "localhost:5173 authorised — $ALLOWED" || c_bad "no Access-Control-Allow-Origin for localhost:5173"

VERCEL=$(curl -sS -D - -o /dev/null -X OPTIONS \
  -H 'Origin: https://sprint11-frontend.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  "$BASE_URL/api/posts" | tr -d '\r' | grep -i '^access-control-allow-origin' || true)
[[ -n "$VERCEL" ]] && c_ok "*.vercel.app authorised — $VERCEL" || c_bad "Vercel origin blocked"

BLOCKED=$(curl -sS -D - -o /dev/null -X OPTIONS \
  -H 'Origin: https://evil.example.com' \
  -H 'Access-Control-Request-Method: POST' \
  "$BASE_URL/api/posts" | tr -d '\r' | grep -i '^access-control-allow-origin' || true)
[[ -z "$BLOCKED" ]] && c_ok "unknown origin https://evil.example.com rejected" || c_bad "unknown origin was authorised"

step "8. Persistence check"
STATUS=$(request GET /api/posts)
assert_eq "GET /api/posts still responsive" "$STATUS" "200"
echo "      documents now: $(json_get "$TMP_DIR/body.json" count) (was $INITIAL_COUNT)"

echo
echo "=============================================================="
printf ' RESULT: %d passed, %d failed\n' "$PASS" "$FAIL"
echo "=============================================================="
[[ "$FAIL" -eq 0 ]] || exit 1
