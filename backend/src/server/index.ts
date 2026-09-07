import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { healthRoutes } from "./routes/health.js";
import { currencyRoutes } from "./routes/currencies.js";
import { launchRoutes } from "./routes/launches.js";

export async function buildServer() {
  const app = Fastify({
    logger,
    trustProxy: true,
    bodyLimit: 256 * 1024, // 256 KB
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // API-only, no HTML shipped
  });
  await app.register(cors, {
    origin: config.CORS_ORIGIN.length > 0 ? config.CORS_ORIGIN : true,
    credentials: false,
    methods: ["GET", "POST"],
  });
  await app.register(rateLimit, {
    global: true,
    max: 60, // 60 req/min per IP by default
    timeWindow: "1 minute",
  });

  await app.register(healthRoutes);
  await app.register(currencyRoutes);
  await app.register(launchRoutes);

  return app;
}

export async function startServer() {
  const app = await buildServer();
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  logger.info({ port: config.PORT }, "bankpad api listening");
  return app;
}
