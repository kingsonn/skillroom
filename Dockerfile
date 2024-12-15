# Install dependencies only when needed
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies needed for build
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_PUBLIC_SUPABASE_URL=https://uzufwojpgyxicaypshtj.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dWZ3b2pwZ3l4aWNheXBzaHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODAxOTcsImV4cCI6MjA0OTY1NjE5N30.azYnTVbCUy2edOB8nt3NUuw-UF6CVgaYoidpPMFtiuE
ENV NEXT_PUBLIC_LANGFLOW_API_TOKEN=AstraCS:KsJIgXpPBGQlUgTCscrUKmZJ:c011c832c39619c01666f6db5a60b7cebc93fd45e4ebae9db44e1c0887e453e0
ENV NEXT_PUBLIC_LANGFLOW_API_URL=https://api.langflow.astra.datastax.com/lf/42ddac8d-fc81-42af-bfd2-ca48f2d02204/api/v1/run/sf1

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Create public directory if it doesn't exist
RUN mkdir -p public

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set environment variables for runtime
ENV NEXT_PUBLIC_SUPABASE_URL=https://uzufwojpgyxicaypshtj.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dWZ3b2pwZ3l4aWNheXBzaHRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwODAxOTcsImV4cCI6MjA0OTY1NjE5N30.azYnTVbCUy2edOB8nt3NUuw-UF6CVgaYoidpPMFtiuE
ENV NEXT_PUBLIC_LANGFLOW_API_TOKEN=AstraCS:KsJIgXpPBGQlUgTCscrUKmZJ:c011c832c39619c01666f6db5a60b7cebc93fd45e4ebae9db44e1c0887e453e0
ENV NEXT_PUBLIC_LANGFLOW_API_URL=https://api.langflow.astra.datastax.com/lf/42ddac8d-fc81-42af-bfd2-ca48f2d02204/api/v1/run/sf1

EXPOSE 8080

CMD ["node", "server.js"]
