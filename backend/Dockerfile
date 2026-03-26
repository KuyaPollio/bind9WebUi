FROM node:18-alpine

# dumb-init: PID 1; su-exec: drop root after fixing bind-mount ownership
RUN apk add --no-cache dumb-init su-exec

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy application code
COPY --chown=nodejs:nodejs . .

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create necessary directories
RUN mkdir -p /app/data /app/bind9/config /app/bind9/records && \
    chown -R nodejs:nodejs /app

# Runtime uses root only for entrypoint (chown volumes), then su-exec to nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD su-exec nodejs node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application (see docker-entrypoint.sh)
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
