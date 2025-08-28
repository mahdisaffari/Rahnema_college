FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Generate Prisma client (safe at build time)
RUN npx prisma generate

# Expose the app port
EXPOSE 3000

# Run migrations when container starts, then start the app
CMD npx prisma migrate deploy && npm start
