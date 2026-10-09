# Game server: Node.js + Socket.IO.
# Build from the repository root: docker build -f packages/server/Dockerfile -t time-to-play-server .

FROM node:20.19-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN npm ci --workspace=@ttp/server --include-workspace-root=false
COPY packages/shared packages/shared
COPY packages/server packages/server
RUN npm run build --workspace=@ttp/server

FROM node:20.19-alpine
ENV NODE_ENV=production \
    SERVER_PORT=3001
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN npm ci --omit=dev --workspace=@ttp/server --include-workspace-root=false \
    && npm cache clean --force
COPY --from=build /app/packages/server/dist packages/server/dist

USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s \
  CMD wget -qO- "http://127.0.0.1:${SERVER_PORT}/health" || exit 1
CMD ["node", "packages/server/dist/index.js"]
