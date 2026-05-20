FROM node:22-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml .npmrc pnpm.yaml /app/
RUN \
  --mount=type=cache,target=/pnpm/store \
  pnpm install --frozen-lockfile || true
COPY rsbuild.config.ts tsconfig.json /app/
COPY src/ /app/src
#RUN pnpm run build --skip-deps-check
RUN ./node_modules/.bin/rsbuild build

FROM joseluisq/static-web-server:2
COPY --from=builder /app/dist /public/query-interface
ENV SERVER_ROOT=/public
