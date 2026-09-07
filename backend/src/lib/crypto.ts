import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { config } from "../config.js";

/** AES-256-GCM at-rest encryption for operator keys.
 *
 * Format on disk (in the EncryptedKey table): three separate columns for
 * iv (12 bytes), ciphertext (variable), authTag (16 bytes). Each row also
 * stores `keyVersion` so we can rotate the master key without a schema
 * change — old rows decrypt with the old master, new rows with the new
 * one, and the migration is a re-encrypt loop.
 *
 * The master key comes from BANKPAD_MASTER_KEY (validated at boot in
 * config.ts to be exactly 32 hex-bytes). It never leaves the process
 * memory; the logger is configured to redact it on the way out. */

const ALGO = "aes-256-gcm";
const IV_LEN = 12; // 96-bit IV recommended for GCM
const TAG_LEN = 16;

function masterKeyBytes(): Buffer {
  return Buffer.from(config.BANKPAD_MASTER_KEY, "hex");
}

export type EncryptedPayload = {
  iv: Buffer;
  ciphertext: Buffer;
  authTag: Buffer;
  keyVersion: number;
};

export function encrypt(plaintext: Buffer | string): EncryptedPayload {
  const key = masterKeyBytes();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const buf = typeof plaintext === "string" ? Buffer.from(plaintext, "utf8") : plaintext;
  const ciphertext = Buffer.concat([cipher.update(buf), cipher.final()]);
  const authTag = cipher.getAuthTag();
  if (authTag.length !== TAG_LEN) {
    throw new Error(`Unexpected GCM auth tag length: ${authTag.length}`);
  }
  return { iv, ciphertext, authTag, keyVersion: config.BANKPAD_MASTER_KEY_VERSION };
}

export function decrypt(payload: EncryptedPayload): Buffer {
  if (payload.iv.length !== IV_LEN) throw new Error("Invalid IV length");
  if (payload.authTag.length !== TAG_LEN) throw new Error("Invalid auth tag length");
  if (payload.keyVersion !== config.BANKPAD_MASTER_KEY_VERSION) {
    // The active key does not match the row's version. In production the
    // rotation script re-encrypts rows before we cut over; hitting this
    // path in normal operation is a bug worth alerting on.
    throw new Error(
      `Encrypted row uses key version ${payload.keyVersion}, active key is version ${config.BANKPAD_MASTER_KEY_VERSION}. Run the rotation migration.`,
    );
  }
  const key = masterKeyBytes();
  const decipher = createDecipheriv(ALGO, key, payload.iv);
  decipher.setAuthTag(payload.authTag);
  return Buffer.concat([decipher.update(payload.ciphertext), decipher.final()]);
}

export function decryptToString(payload: EncryptedPayload): string {
  return decrypt(payload).toString("utf8");
}
