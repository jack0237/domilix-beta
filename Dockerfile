# ── Stage 1 : Build du frontend Preact ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : Image de production ────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Dépendances de production uniquement
COPY package*.json ./
RUN npm ci --omit=dev

# Copier le serveur et le build du frontend
COPY server ./server
COPY --from=builder /app/dist ./dist

# Dossier pour la persistance du fichier Excel
RUN mkdir -p data

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server/index.cjs"]
