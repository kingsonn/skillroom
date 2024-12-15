# Use Node.js 18 as the base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV production
ENV PORT 8080

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm ci --only=production

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
