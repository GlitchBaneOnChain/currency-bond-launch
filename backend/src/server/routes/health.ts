import type { FastifyInstance } from "fastify";
import { db } from "../../db.js";
import { getPublicClient } from "../../chain/clients.js";

/** GET /health — liveness + dependency probe. */
export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const [dbOk, chainOk] = await Promise.all([
      db.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      getPublicClient()
        .getBlockNumber()
        .then((n) => Number(n) > 0)
        .catch(() => false),
    ]);
    const ok = dbOk && chainOk;
    return { ok, db: dbOk, chain: chainOk };
  });
}
