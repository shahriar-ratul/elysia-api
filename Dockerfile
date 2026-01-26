# Multi-stage Dockerfile for Bun + Elysia application

# Stage 1: Build stage
FROM oven/bun:1.3.4 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy Prisma schema files and environment example (needed to generate client)
COPY prisma ./prisma
COPY .env.example ./.env.example

# Generate Prisma client (schema is in prisma/schema/schema.prisma)
# DATABASE_URL is not needed for generation, but prisma.config.ts tries to load it
# Set a dummy value to satisfy the config file (actual DATABASE_URL comes from compose at runtime)
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" bunx prisma generate --schema prisma/schema/schema.prisma

# Copy source code
COPY . .

# Type check first, then build with SWC (fast!)
# Externalize Prisma runtime modules - they use dynamic imports and must be available at runtime
RUN bun run typecheck && \
    rm -rf dist && \
    bun build ./src/index.ts --outdir ./dist --target bun \
    --external "@prisma/client/runtime/query_compiler_bg.postgresql.mjs" \
    --external "@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs" \
    --external "@prisma/adapter-pg"

# Stage 2: Production stage
FROM oven/bun:1.3.4-slim

WORKDIR /app

# Create non-root user and install wget for healthcheck and openssl for JWT_SECRET generation
# Use groupadd/useradd which are more universally available
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --shell /bin/sh --create-home bunuser && \
    apt-get update && \
    apt-get install -y --no-install-recommends wget openssl && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy node_modules from builder (needed for runtime dependencies)
COPY --from=builder --chown=bunuser:nodejs /app/node_modules ./node_modules

# Copy built files
COPY --from=builder --chown=bunuser:nodejs /app/dist ./dist

# Copy generated Prisma client (needed at runtime)
COPY --from=builder --chown=bunuser:nodejs /app/src/generated ./src/generated

# Copy package.json for scripts
COPY --chown=bunuser:nodejs package.json ./

# Copy .env.example and entrypoint script
COPY --chown=bunuser:nodejs .env.example ./.env.example
COPY --chown=bunuser:nodejs docker-entrypoint.sh ./docker-entrypoint.sh

# Make entrypoint script executable (still as root)
RUN chmod +x docker-entrypoint.sh

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

# Use entrypoint to setup .env before starting the application
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the application
CMD ["bun", "dist/index.js"]
