# syntax=docker/dockerfile:1
# See here for image contents: https://github.com/devcontainers/images/tree/main/src/javascript-node

# [Choice] Node.js version and OS variant, e.g. 24-trixie, 24-bookworm, 22-trixie
ARG VARIANT="24-trixie"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

ARG EMSDK_VERSION="3.1.64"

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        build-essential ca-certificates git python3 xz-utils \
    && rm -rf /var/lib/apt/lists/* \
    && git clone --depth 1 --branch "${EMSDK_VERSION}" \
        https://github.com/emscripten-core/emsdk.git /opt/emsdk \
    && chown -R node:node /opt/emsdk \
    && su - node -c "cd /opt/emsdk && ./emsdk install ${EMSDK_VERSION} && ./emsdk activate ${EMSDK_VERSION}"

ENV EMSDK=/opt/emsdk
ENV EM_CONFIG=/opt/emsdk/.emscripten
ENV PATH="/opt/emsdk:/opt/emsdk/upstream/emscripten:${PATH}"

RUN emcc --version
