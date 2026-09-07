#!/bin/sh
set -eu

# Replace build-time placeholder tokens with actual runtime env var values.
# Env vars come from K8s ConfigMap (no VITE_ prefix); placeholders use VITE_ prefix
# matching exactly what Vite baked into the JS bundle at image build time.
find /usr/share/nginx/html/assets -name '*.js' | while read f; do
  sed -i \
    -e "s|__VITE_ETHEREUM_CHAIN_ID__|${ETHEREUM_CHAIN_ID:-}|g" \
    -e "s|__VITE_ETHEREUM_RPC_URL__|${ETHEREUM_RPC_URL:-}|g" \
    -e "s|__VITE_ETHEREUM_EXPLORER_URL__|${ETHEREUM_EXPLORER_URL:-}|g" \
    -e "s|__VITE_ETHEREUM_BRIDGE_CONTRACT_ADDRESS__|${ETHEREUM_BRIDGE_CONTRACT_ADDRESS:-}|g" \
    -e "s|__VITE_ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT__|${ETHEREUM_FORCE_UPDATE_GLOBAL_EXIT_ROOT:-true}|g" \
    -e "s|__VITE_ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS__|${ETHEREUM_PROOF_OF_EFFICIENCY_CONTRACT_ADDRESS:-}|g" \
    -e "s|__VITE_ETHEREUM_ROLLUP_MANAGER_ADDRESS__|${ETHEREUM_ROLLUP_MANAGER_ADDRESS:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_CHAIN_ID__|${POLYGON_ZK_EVM_CHAIN_ID:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_RPC_URL__|${POLYGON_ZK_EVM_RPC_URL:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_EXPLORER_URL__|${POLYGON_ZK_EVM_EXPLORER_URL:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS__|${POLYGON_ZK_EVM_BRIDGE_CONTRACT_ADDRESS:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_NETWORK_ID__|${POLYGON_ZK_EVM_NETWORK_ID:-}|g" \
    -e "s|__VITE_POLYGON_ZK_EVM_NETWORK_NAME__|${POLYGON_ZK_EVM_NETWORK_NAME:-}|g" \
    -e "s|__VITE_BRIDGE_API_URL__|${BRIDGE_API_URL:-}|g" \
    -e "s|__VITE_REOWN_PROJECT_ID__|${REOWN_PROJECT_ID:-}|g" \
    -e "s|__VITE_RESOLVE_RELATIVE_URLS__|${RESOLVE_RELATIVE_URLS:-false}|g" \
    -e "s|__VITE_ENABLE_FIAT_EXCHANGE_RATES__|${ENABLE_FIAT_EXCHANGE_RATES:-false}|g" \
    -e "s|__VITE_ENABLE_OUTDATED_NETWORK_MODAL__|${ENABLE_OUTDATED_NETWORK_MODAL:-false}|g" \
    -e "s|__VITE_ENABLE_DEPOSIT_WARNING__|${ENABLE_DEPOSIT_WARNING:-false}|g" \
    -e "s|__VITE_ENABLE_REPORT_FORM__|${ENABLE_REPORT_FORM:-false}|g" \
    "$f"
done

# Link unfurlers (Twitter, Telegram, Discord, Facebook) require an absolute
# og:image / twitter:image URL. When PUBLIC_URL is provided (e.g. https://bridge.example.com),
# rewrite the static tags in index.html so crawlers see a fetchable HTTPS image.
PUBLIC_ORIGIN="${PUBLIC_URL:-${BRIDGE_UI_PUBLIC_URL:-}}"
if [ -n "$PUBLIC_ORIGIN" ]; then
  PUBLIC_ORIGIN="${PUBLIC_ORIGIN%/}"
  sed -i "s|content=\"/og-image.png\"|content=\"${PUBLIC_ORIGIN}/og-image.png\"|g" \
    /usr/share/nginx/html/index.html
fi

exec nginx -g 'daemon off;'
