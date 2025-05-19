# Build stage
FROM oven/bun:1 as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY client/package.json client/bun.lock ./client/
COPY server/package.json server/bun.lock ./server/

# Install dependencies without running postinstall scripts
RUN bun install --no-scripts

# Copy the rest of the application
COPY . .

# Build packages
RUN bun run build

# Production stage
FROM oven/bun:1-slim

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/client/package.json /app/client/bun.lock ./client/
COPY --from=builder /app/server/package.json /app/server/bun.lock ./server/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

# Install production dependencies only
RUN bun install --production --no-scripts

# Expose ports
EXPOSE 3000 5173

# Start the application
CMD ["bun", "run", "start"] 
