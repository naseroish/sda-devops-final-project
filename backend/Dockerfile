# ======================
# Stage 1: Build
# ======================
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ======================
# Stage 2: Runtime
# ======================
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

ENV PORT=8706
EXPOSE 8706

CMD ["node", "dist/server.js"]
