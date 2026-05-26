# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src/ src/

RUN npm run build

# Stage 2: Production server
FROM node:22-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

COPY server/lib/ ./server/lib/
COPY server/routes/ ./server/routes/
COPY server/index.js ./server/index.js

COPY --from=frontend-build /app/dist ./dist

RUN mkdir -p /app/server/data

EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index.js"]
