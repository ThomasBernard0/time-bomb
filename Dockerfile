# ---- Frontend Build Stage ----
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build
# The build output is typically in 'dist' or 'build' folder inside /app/frontend/

# ---- Backend Build Stage ----
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend

# Copy package files and install dependencies (including dev for build)
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Copy the rest of the backend code
COPY backend/ ./

# Build the backend
RUN npm run build
# The build output is typically in 'dist' folder inside /app/backend/

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create a directory for the backend
RUN mkdir -p backend

# Copy backend package files and install *only* production dependencies
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci --only=production

# Copy built backend from the backend-builder stage
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy built frontend from the frontend-builder stage
# We'll assume NestJS will serve static files from a 'public' directory
# relative to the backend's root (which will be /app/backend at runtime)
RUN mkdir -p ./backend/public
COPY --from=frontend-builder /app/frontend/dist ./backend/public

# Expose the port the backend runs on
EXPOSE 3000

# Command to run the backend application
# Adjust 'backend/dist/main.js' if your entry point is different
CMD ["node", "backend/dist/main.js"]