import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

/** Single Prisma client for the whole process. */
export const db = new PrismaClient({
  log: [
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

db.$on("warn", (e) => logger.warn({ msg: e.message }, "prisma warn"));
db.$on("error", (e) => logger.error({ msg: e.message }, "prisma error"));

export async function closeDb() {
  await db.$disconnect();
}
