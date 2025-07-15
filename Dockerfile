FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production && npm cache clean --force

# Expose port (Smithery will set PORT env var)
EXPOSE 3000

# Set environment for HTTP mode
ENV MCP_MODE=http

# Start the server
CMD ["node", "dist/index.js"]