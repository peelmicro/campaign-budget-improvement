# ── Stage 1: Install dependencies ──
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json ./
RUN pnpm install

# ── Stage 2: Build the Angular app ──
FROM deps AS build
COPY . .
RUN pnpm nx build web --configuration=production

# ── Stage 3: Serve with Nginx ──
FROM nginx:alpine AS production
COPY --from=build /app/dist/web/browser /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
