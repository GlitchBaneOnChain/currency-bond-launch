#!/usr/bin/env bash
# Bankpad backend one-shot server bootstrap. Runs on a fresh Ubuntu
# 22.04+ droplet (root user). Idempotent — safe to re-run.
#
# Usage on the server:
#   curl -fsSL https://raw.githubusercontent.com/GlitchBaneOnChain/currency-bond-launch/main/backend/scripts/bootstrap.sh | bash
set -euo pipefail

REPO="https://github.com/GlitchBaneOnChain/currency-bond-launch.git"
REPO_DIR="/opt/bankpad"
DOMAIN_API="api.bankpad.fun"

log() { printf "\n\033[1;32m→ %s\033[0m\n" "$*"; }

log "Installing docker + git + caddy"
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
fi
apt-get update -y
apt-get install -y git curl ufw
if ! command -v caddy >/dev/null 2>&1; then
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
        | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
        | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y
    apt-get install -y caddy
fi

log "Firewall: allow SSH, HTTP, HTTPS only"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

log "Cloning repo to $REPO_DIR"
if [ -d "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" pull --ff-only
else
    git clone "$REPO" "$REPO_DIR"
fi
cd "$REPO_DIR/backend"

log "Writing .env (generates BANKPAD_MASTER_KEY if missing)"
if [ ! -f .env ]; then
    MASTER_KEY=$(openssl rand -hex 32)
    cat > .env <<EOF
NODE_ENV=production
LOG_LEVEL=info
ROBINHOOD_RPC_URL=https://rpc.mainnet.chain.robinhood.com
DATABASE_URL=postgresql://bankpad:bankpad@postgres:5432/bankpad
REDIS_URL=redis://redis:6379
BANKPAD_MASTER_KEY=$MASTER_KEY
BANKPAD_MASTER_KEY_VERSION=1
# Fill in with the address from \`cast wallet new\` once you seed it:
BANKPAD_OPERATOR_ADDRESS=
PORT=8080
CORS_ORIGIN=https://bankpad.fun,https://www.bankpad.fun,https://bankpad.netlify.app
BANKPAD_PAUSE=0
BANKPAD_WETH=0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73
UNISWAP_V3_FACTORY=0x1f7d7550B1b028f7571E69A784071F0205FD2EfA
UNISWAP_V3_NFPM=0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3
UNISWAP_V3_SWAP_ROUTER=0xcaf681a66D020601342297493863e78c959E5cB2
EOF
    chmod 600 .env
    echo "  Generated new master key (32 bytes). It lives only in $REPO_DIR/backend/.env."
    echo "  Print it once for offsite backup, then never again:"
    grep BANKPAD_MASTER_KEY .env
else
    echo "  .env already present; leaving as-is."
fi

log "Bringing up docker compose stack (postgres + redis + api + worker)"
docker compose pull || true
docker compose up -d --build

log "Waiting for API to answer /health"
for i in $(seq 1 30); do
    if curl -sf http://localhost:8080/health >/dev/null; then break; fi
    sleep 2
done
curl -sf http://localhost:8080/health && echo || {
    echo "API did not come up in 60s — check: docker compose logs -f api"
    exit 1
}

log "Configuring Caddy reverse proxy for $DOMAIN_API"
tee /etc/caddy/Caddyfile >/dev/null <<EOF
$DOMAIN_API {
    reverse_proxy localhost:8080
    encode gzip
}
EOF
systemctl reload caddy || systemctl restart caddy

log "Done."
echo
echo "Next steps (on your laptop):"
echo "  1. Point $DOMAIN_API at this server's IP in GoDaddy DNS."
echo "  2. cast wallet new  → paste the private key into the seed script (see backend/scripts/seed-operator-key.mjs)."
echo "  3. Fund the new operator address with ~0.05 ETH on Robinhood Chain."
echo "  4. On this server: docker compose exec api node /app/dist/scripts/seed-operator-key.js"
echo "     (or run the source .mjs — see the file's header comment)."
echo "  5. netlify env:set VITE_BANKPAD_API_URL https://$DOMAIN_API and redeploy the frontend."
