# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (Vite frontend + esbuild backend)
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env.example

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
