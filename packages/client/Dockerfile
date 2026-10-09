# Web client: static build served by nginx, which also proxies /socket.io to the server.
# Build from the repository root: docker build -f packages/client/Dockerfile -t time-to-play-client .

FROM node:20.19-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN npm ci --workspace=@ttp/client --include-workspace-root=false
COPY packages/shared packages/shared
COPY packages/client packages/client
RUN npm run build --workspace=@ttp/client

FROM nginx:1.27-alpine
# Where nginx forwards the game connections. Override it when the server runs elsewhere.
ENV SERVER_URL=http://server:3001
COPY packages/client/docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz >/dev/null || exit 1
