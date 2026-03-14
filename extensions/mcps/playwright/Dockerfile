# Build stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --production
# Install only chromium for lightness
RUN npx playwright install chromium

ENTRYPOINT ["node", "dist/index.js"]
