#!/usr/bin/env bash
set -eu

echo "🚀 Starting local development setup..."

# بارگذاری env
if [ -f .env ]; then
  set -a
  . .env
  set +a
fi

# DATABASE_URL و SHADOW_DATABASE_URL بر اساس localhost و پورت مپ‌شده
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@188.121.116.152:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
export SHADOW_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@188.121.116.152:${POSTGRES_PORT}/${POSTGRES_DB}_shadow?schema=public"

# صبر کردن تا دیتابیس آماده شود
echo "⏳ Waiting for PostgreSQL on localhost:${POSTGRES_PORT} ..."
until pg_isready -h 188.121.116.152 -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" >/dev/null 2>&1; do
  echo "… still waiting"
  sleep 2
done
echo "✅ PostgreSQL is ready."

# ایجاد دیتابیس شَدو در صورت نبود
echo "🔍 Checking for shadow database: ${POSTGRES_DB}_shadow"
psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@188.121.116.152:${POSTGRES_PORT}/postgres" \
  -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}_shadow'" | grep -q 1 || \
  psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@188.121.116.152:${POSTGRES_PORT}/postgres" \
    -c "CREATE DATABASE ${POSTGRES_DB}_shadow;"
echo "✅ Shadow database ready: ${POSTGRES_DB}_shadow"

# اجرای migrate
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# اجرای اپ
echo "🎯 Starting backend..."
exec npm start
