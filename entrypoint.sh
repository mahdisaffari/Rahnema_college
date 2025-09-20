#!/usr/bin/env sh
set -eu

# load .env file
if [ -f .env ]; then
  set -a
  . .env
  set +a
fi

: "${DATABASE_URL?DATABASE_URL must be set (e.g. postgresql://user:pass@host:5432/db)}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing $1" >&2; exit 1; }; }
need pg_isready
need psql
need npx

db_name_from_url() {
  # last path segment, strip query
  # e.g. postgresql://.../mydb?sslmode=disable -> mydb
  local url="$1"
  local name="${url##*/}"
  printf '%s\n' "${name%%\?*}"
}

admin_url_from_url() {
  # replace trailing /<dbname>[?query] with /postgres
  # e.g. postgresql://.../mydb?sslmode=disable -> postgresql://.../postgres
  local url="$1"
  printf '%s/postgres\n' "${url%/*}"
}

DB_NAME="$(db_name_from_url "$DATABASE_URL")"
ADMIN_URL="$(admin_url_from_url "$DATABASE_URL")"

echo "Waiting for PostgreSQL at: $ADMIN_URL"
until pg_isready -d "$ADMIN_URL" >/dev/null 2>&1; do
  sleep 1
done

echo "Ensuring database '$DB_NAME' exists..."
# Note: small race is possible with concurrent creators; tolerate 'already exists'
set +e
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT 'CREATE DATABASE "' || replace('$DB_NAME','"','""') || '"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')
\gexec
SQL
rc=$?
set -e
if [ $rc -ne 0 ]; then
  echo "Notice: CREATE DATABASE may have raced or failed; checking existence..."
  if ! psql "$ADMIN_URL" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "Error: database '$DB_NAME' still not present"; exit 1
  fi
fi

# Shadow DB on its own host (optional)
if [ -n "${SHADOW_DATABASE_URL:-}" ]; then
  SHADOW_DB_NAME="$(db_name_from_url "$SHADOW_DATABASE_URL")"
  SHADOW_ADMIN_URL="$(admin_url_from_url "$SHADOW_DATABASE_URL")"
  echo "Waiting for shadow PostgreSQL at: $SHADOW_ADMIN_URL"
  until pg_isready -d "$SHADOW_ADMIN_URL" >/dev/null 2>&1; do
    sleep 1
  done
  echo "Ensuring shadow database '$SHADOW_DB_NAME' exists..."
  set +e
  psql "$SHADOW_ADMIN_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT 'CREATE DATABASE "' || replace('$SHADOW_DB_NAME','"','""') || '"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$SHADOW_DB_NAME')
\gexec
SQL
  set -e
fi

echo "Applying Prisma migrations..."
npx prisma migrate deploy

echo "Starting app..."
exec npm start
