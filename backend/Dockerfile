FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy all source code to the container
COPY . .

# Create non-root user for running the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (adjust based on your application)
EXPOSE 3000

# Health check (adjust if needed for your app's health-check file)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start application (adjust if needed to match your app's entry file)
CMD ["node", "src/server.js"]
