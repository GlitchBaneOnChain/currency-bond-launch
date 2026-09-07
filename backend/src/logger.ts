import pino, { type LoggerOptions } from "pino";
import { config } from "./config.js";

/** Structured logger. Attaches a redaction list so a stray log of a full
 * env object or a decrypted key blob is scrubbed on the way out. */
const opts: LoggerOptions = {
  level: config.LOG_LEVEL,
  base: { service: "bankpad-backend" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "privateKey",
      "masterKey",
      "ciphertext",
      "iv",
      "authTag",
      "BANKPAD_MASTER_KEY",
    ],
    censor: "[REDACTED]",
  },
};

if (config.NODE_ENV === "development") {
  opts.transport = { target: "pino-pretty", options: { colorize: true } };
}

export const logger = pino(opts);

/** Never accepts a full key. Callers must pass the address + purpose only. */
export function keyContext(address: string, purpose: string): Record<string, string> {
  return { keyAddress: address, keyPurpose: purpose };
}
