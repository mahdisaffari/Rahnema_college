#!/usr/bin/env sh
set -eu

echo "🚀 Starting local development setup..."

# Load environment variables
if [ -f .env ]; then
  set -a
  . .env
  set +a
fi

# Override DATABASE_URL to use localhost
export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/@postgres:/@localhost:/')
if [ -n "${SHADOW_DATABASE_URL:-}" ]; then
  export SHADOW_DATABASE_URL=$(echo "$SHADOW_DATABASE_URL" | sed 's/@postgres:/@localhost:/')
fi

echo "📦 Starting PostgreSQL service..."
# Check if user has Docker permissions, use sudo if needed
if docker ps >/dev/null 2>&1; then
  docker compose up -d postgres
else
  echo "⚠️  Docker permission issue detected, using sudo..."
  sudo docker compose up -d postgres
fi

echo "⏳ Waiting for PostgreSQL to be ready..."
# Use the same Docker command style as above
if docker ps >/dev/null 2>&1; then
  until docker exec my_postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
  done
else
  until sudo docker exec my_postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
  done
fi

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "🎯 Starting backend with npm start..."
npm start
