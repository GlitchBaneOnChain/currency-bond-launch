import { db } from "../db.js";
import { decryptToString } from "./crypto.js";
import { makeWalletClient } from "../chain/clients.js";
import type { Address, Hex, WalletClient } from "viem";

/** Load the automation-operator wallet client. Reads the encrypted key
 * from the DB, decrypts it in memory, hands back a viem wallet client,
 * and never returns the plaintext to callers. */
export async function loadOperatorWallet(operatorAddress: Address): Promise<WalletClient> {
  const row = await db.encryptedKey.findUnique({ where: { address: operatorAddress } });
  if (!row) throw new Error(`No encrypted key on file for operator ${operatorAddress}`);
  // Prisma returns Uint8Array for Bytes columns; the crypto module works in
  // node Buffer. Wrap without copying (Buffer.from(Uint8Array) shares the
  // underlying ArrayBuffer).
  const plaintext = decryptToString({
    iv: Buffer.from(row.iv),
    ciphertext: Buffer.from(row.ciphertext),
    authTag: Buffer.from(row.authTag),
    keyVersion: row.keyVersion,
  });
  if (!plaintext.startsWith("0x")) throw new Error("stored key is not 0x-prefixed hex");
  return makeWalletClient(plaintext as Hex);
}
