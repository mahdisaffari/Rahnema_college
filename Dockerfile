FROM node:20-alpine

WORKDIR /app

# OS deps for waiting on Postgres
RUN apk add --no-cache postgresql-client bash

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client at build time (doesn't need DB)
RUN npx prisma generate

EXPOSE 3000

# Use our entrypoint to wait → migrate → start
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
