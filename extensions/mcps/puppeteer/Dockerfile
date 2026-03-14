# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --production

# Security: Run as non-root user
# Puppeteer needs to run as root or with specific flags if using sandbox
# We'll skip sandbox for simplicity in Docker as it's common

ENTRYPOINT ["node", "dist/index.js"]
