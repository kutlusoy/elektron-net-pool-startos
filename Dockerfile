FROM node:24-bookworm-slim AS build

ARG ELEKTRON_POOL_REF=main
ARG ELEKTRON_POOL_UI_REF=main

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential ca-certificates cmake curl git python3 wget && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /build

# ---- Elektron Net Pool backend ----
RUN \
    git clone https://github.com/kutlusoy/elektron-net-pool.git && \
    cd elektron-net-pool && \
    git checkout ${ELEKTRON_POOL_REF}

RUN \
    cd elektron-net-pool && \
    npm ci --no-audit --no-fund && \
    NODE_ENV=production npm run build && \
    npm prune --production

# ---- Elektron Net Pool UI ----
RUN \
    git clone https://github.com/kutlusoy/elektron-net-pool-ui.git && \
    cd elektron-net-pool-ui && \
    git checkout ${ELEKTRON_POOL_UI_REF}

# self-hosting config baked at build time; STRATUM_URL / SECURE_STRATUM_URL
# placeholders are sed-replaced by main.ts at start
COPY assets/patches/environment.prod.ts /build/elektron-net-pool-ui/src/environments/environment.prod.ts

RUN \
    cd elektron-net-pool-ui && \
    npm ci --no-audit --no-fund && \
    NODE_ENV=production npm run build && \
    npm prune --production

# ---- Final image ----
FROM node:24-bookworm-slim

ENV NODE_ENV=production

WORKDIR /elektron-pool

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nginx && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./assets/nginx.conf /etc/nginx/sites-available/default

COPY --from=build /build/elektron-net-pool/node_modules ./node_modules
COPY --from=build /build/elektron-net-pool/dist ./dist

WORKDIR /var/www/html
COPY --from=build /build/elektron-net-pool-ui/dist/elektron-net-pool-ui .
