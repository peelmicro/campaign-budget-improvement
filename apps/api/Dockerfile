# ── Stage 1: Install dependencies ──
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json ./
RUN pnpm install

# ── Stage 2: Build the API ──
FROM deps AS build
COPY . .
RUN pnpm nx build api --configuration=production

# ── Stage 3: Production image ──
FROM node:24-alpine AS production
WORKDIR /app

COPY --from=build /app/dist/apps/api ./
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "main.js"]
