# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server .
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend build
COPY --from=backend-builder /app/server/dist ./dist

# Copy frontend build to public directory served by backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/data/database.sqlite

# Expose port
EXPOSE 8080

# Start command
CMD ["node", "dist/index.js"]
