# Multi-stage Dockerfile for Bun + Elysia application

# Stage 1: Build stage
FROM oven/bun:1.3.4 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Type check first, then build with SWC (fast!)
RUN bun run build

# Stage 2: Production stage
FROM oven/bun:1.3.4-slim

WORKDIR /app

# Create non-root user and install wget for healthcheck
# Use groupadd/useradd which are more universally available
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --shell /bin/sh --create-home bunuser && \
    apt-get update && \
    apt-get install -y --no-install-recommends wget && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy node_modules from builder (needed for runtime dependencies)
COPY --from=builder --chown=bunuser:nodejs /app/node_modules ./node_modules

# Copy built files
COPY --from=builder --chown=bunuser:nodejs /app/dist ./dist

# Copy package.json for scripts
COPY --chown=bunuser:nodejs package.json ./

# Switch to non-root user
USER bunuser

# Expose port
EXPOSE 4000

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1

# Start the application
CMD ["bun", "dist/index.js"]
