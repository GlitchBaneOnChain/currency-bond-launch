import type { FastifyInstance } from "fastify";
import { REWARD_CURRENCIES } from "../../registry/currencies.js";

/** GET /currencies — the reward-currency allowlist the frontend renders
 * as "launchable now" vs "coming soon". */
export async function currencyRoutes(app: FastifyInstance) {
  app.get("/currencies", async () => {
    return {
      currencies: REWARD_CURRENCIES.map((c) => ({
        code: c.code,
        address: c.address,
        decimals: c.decimals,
        minPoolDepthUsd: c.minPoolDepthUsd,
      })),
    };
  });
}
