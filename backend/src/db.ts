import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

/** Single Prisma client for the whole process.
 * Log routing is set up here so we get warnings + errors in the app log
 * without emitting SQL by default. */
export const db = new PrismaClient({
  log: [
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

// @ts-expect-error - Prisma's event typing across versions is loose here;
// the runtime shape is `{ message: string }` for warn/error.
db.$on("warn", (e: { message: string }) => logger.warn({ msg: e.message }, "prisma warn"));
// @ts-expect-error - see above.
db.$on("error", (e: { message: string }) => logger.error({ msg: e.message }, "prisma error"));

export async function closeDb() {
  await db.$disconnect();
}
