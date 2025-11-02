# Build stage
FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy workspace root files needed for Nx
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy API source code and configuration
COPY api ./api

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Build the API application
RUN npx nx build api --configuration=production

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy the built application from builder
COPY --from=builder /workspace/api/dist ./

# Install production dependencies only (using the pruned package.json from dist)
RUN npm ci --omit=dev --ignore-scripts

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "main.js"]

