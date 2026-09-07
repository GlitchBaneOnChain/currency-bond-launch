// Seed the automation-operator's encrypted private key into the DB.
//
// Runs on the server, INSIDE the api container, so it uses the same
// DATABASE_URL and BANKPAD_MASTER_KEY the workers do:
//
//   docker compose cp backend/scripts/seed-operator-key.mjs api:/app/seed.mjs
//   docker compose exec \
//     -e OPERATOR_PRIVATE_KEY="0x…" \
//     -e OPERATOR_ADDRESS="0x…" \
//     api node seed.mjs
//   docker compose exec api rm seed.mjs
//
// Prefix each command with a space to keep the private key out of your
// shell history (needs HISTCONTROL=ignorespace, which is the default on
// Ubuntu). The key is never written to disk; it lives only in the
// container's env for the length of the exec, and only its AES-256-GCM
// ciphertext lands in the DB.

import { createCipheriv, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const MASTER_KEY = process.env.BANKPAD_MASTER_KEY;
const PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const ADDRESS = process.env.OPERATOR_ADDRESS;
const VERSION = Number(process.env.BANKPAD_MASTER_KEY_VERSION ?? 1);

if (!MASTER_KEY || !/^[0-9a-f]{64}$/i.test(MASTER_KEY)) {
    console.error("BANKPAD_MASTER_KEY is missing or not 32 hex bytes");
    process.exit(1);
}
if (!PRIVATE_KEY || !/^0x[0-9a-f]{64}$/i.test(PRIVATE_KEY)) {
    console.error("OPERATOR_PRIVATE_KEY must be 0x-prefixed 32-byte hex");
    process.exit(1);
}
if (!ADDRESS || !/^0x[0-9a-fA-F]{40}$/.test(ADDRESS)) {
    console.error("OPERATOR_ADDRESS must be a valid EVM address");
    process.exit(1);
}

const key = Buffer.from(MASTER_KEY, "hex");
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const ciphertext = Buffer.concat([cipher.update(PRIVATE_KEY, "utf8"), cipher.final()]);
const authTag = cipher.getAuthTag();

const db = new PrismaClient();
try {
    await db.encryptedKey.upsert({
        where: { address: ADDRESS },
        update: { iv, ciphertext, authTag, keyVersion: VERSION, purpose: "operator" },
        create: { address: ADDRESS, purpose: "operator", keyVersion: VERSION, iv, ciphertext, authTag },
    });
    console.log(`✓ seeded operator key for ${ADDRESS} at version ${VERSION}`);
} finally {
    await db.$disconnect();
}
