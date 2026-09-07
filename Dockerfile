# =============================================================================
# Stage 1: Build
# node + all deps; discarded after build — nothing ships to the runtime image.
# Vite bakes VITE_* values at build time; we use __PLACEHOLDER__ tokens so
# the same image works across envs. entrypoint.sh subs real values via sed.
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY abis ./abis
RUN npm install
COPY . .
RUN VITE_ETHEREUM_CHAIN_ID=__VITE_ETHEREUM_CHAIN_ID__ \
    VITE_ETHEREUM_RPC_URL=__VITE_ETHEREUM_RPC_URL__ \
    VITE_ETHEREUM_EXPLORER_URL=__VITE_ETHEREUM_EXPLORER_URL__ \
    VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS=__VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS__ \
    VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT=__VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT__ \
    VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS=__VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS__ \
    VITE_ETHEREUM_ROLLUP_MANAGER_ADDRESS=__VITE_ETHEREUM_ROLLUP_MANAGER_ADDRESS__ \
    VITE_POLYGON_ZK_EVM_CHAIN_ID=__VITE_POLYGON_ZK_EVM_CHAIN_ID__ \
    VITE_POLYGON_ZK_EVM_RPC_URL=__VITE_POLYGON_ZK_EVM_RPC_URL__ \
    VITE_POLYGON_ZK_EVM_EXPLORER_URL=__VITE_POLYGON_ZK_EVM_EXPLORER_URL__ \
    VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS=__VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS__ \
    VITE_POLYGON_ZK_EVM_NETWORK_ID=__VITE_POLYGON_ZK_EVM_NETWORK_ID__ \
    VITE_POLYGON_ZK_EVM_NETWORK_NAME=__VITE_POLYGON_ZK_EVM_NETWORK_NAME__ \
    VITE_BRIDGE_API_URL=__VITE_BRIDGE_API_URL__ \
    VITE_REOWN_PROJECT_ID=__VITE_REOWN_PROJECT_ID__ \
    VITE_RESOLVE_RELATIVE_URLS=__VITE_RESOLVE_RELATIVE_URLS__ \
    VITE_ENABLE_FIAT_EXCHANGE_RATES=__VITE_ENABLE_FIAT_EXCHANGE_RATES__ \
    VITE_ENABLE_OUTDATED_NETWORK_MODAL=__VITE_ENABLE_OUTDATED_NETWORK_MODAL__ \
    VITE_ENABLE_DEPOSIT_WARNING=__VITE_ENABLE_DEPOSIT_WARNING__ \
    VITE_ENABLE_REPORT_FORM=__VITE_ENABLE_REPORT_FORM__ \
    npm run build

# =============================================================================
# Stage 2: Runtime — nginx:alpine only, no node/npm/vite/node_modules
# =============================================================================
FROM nginx:alpine
RUN apk upgrade --no-cache
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY scripts/entrypoint.sh /entrypoint.sh
# Make html dir writable by nginx user (uid 101) for sed placeholder substitution
RUN chmod +x /entrypoint.sh && chown -R nginx:nginx /usr/share/nginx/html
ENTRYPOINT ["/entrypoint.sh"]
 