#(Build stage)
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arg for API URL (docker build --build-arg NEXT_PUBLIC_API_URL=http://backend:port -t final/frontend .)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL


COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# (Production stage)
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npx", "next", "start"]

#check