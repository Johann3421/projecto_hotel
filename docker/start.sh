#!/bin/sh
set -eu

if [ -d "/app/prisma/migrations" ] && [ "$(find /app/prisma/migrations -mindepth 1 -maxdepth 1 -type d | wc -l)" -gt 0 ]; then
  echo "Applying Prisma migrations..."
  npx prisma migrate deploy
else
  echo "No Prisma migrations found. Running prisma db push..."
  npx prisma db push --skip-generate
fi

echo "Starting Next.js on port ${PORT:-3000}..."
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"