# ---------------------------------------------------------------------------
# Multi-stage production image. The build is fully static; runtime config is
# injected via Nginx, NOT baked secrets. NEVER put a secret in a VITE_ var —
# every VITE_ value is public in the shipped bundle.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm via corepack.
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Install dependencies (cached layer).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build. Public, browser-safe build args only.
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_AUTH_MODE=entra
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_TENANT_ID
ARG VITE_ENTRA_REDIRECT_URI
ARG VITE_ENTRA_API_SCOPE
ENV VITE_ENABLE_MSW=false
RUN pnpm build

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime
# Drop the default site and add our SPA + security-header config.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Run as the unprivileged nginx user.
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
