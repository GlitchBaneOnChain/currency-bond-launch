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
    // Fastify's `logger` accepts a pino instance directly; the type
    // assertion sidesteps the fact that Fastify's own LoggerOptions and
    // pino's LoggerOptions have drifted slightly across versions.
    logger: logger as never,
    trustProxy: true,
    bodyLimit: 256 * 1024,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: config.CORS_ORIGIN.length > 0 ? config.CORS_ORIGIN : true,
    credentials: false,
    methods: ["GET", "POST"],
  });
  await app.register(rateLimit, {
    global: true,
    max: 60,
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
