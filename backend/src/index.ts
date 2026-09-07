import { logger } from "./logger.js";
import { startServer } from "./server/index.js";
import { closeDb } from "./db.js";

async function main() {
  const app = await startServer();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutting down api");
    await app.close();
    await closeDb();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "api boot failed");
  process.exit(1);
});
