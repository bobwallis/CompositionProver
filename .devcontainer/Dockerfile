# syntax=docker/dockerfile:1
# See here for image contents: https://github.com/devcontainers/images/tree/main/src/javascript-node

# [Choice] Node.js version and OS variant, e.g. 24-trixie, 24-bookworm, 22-trixie
ARG VARIANT="24-trixie"
FROM mcr.microsoft.com/devcontainers/javascript-node:${VARIANT}

# Additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# Additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# Global node modules
RUN su node -c "npm install -g gulp-cli http-server"
