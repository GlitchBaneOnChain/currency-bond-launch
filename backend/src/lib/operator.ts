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
  const plaintext = decryptToString({
    iv: row.iv,
    ciphertext: row.ciphertext,
    authTag: row.authTag,
    keyVersion: row.keyVersion,
  });
  try {
    if (!plaintext.startsWith("0x")) throw new Error("stored key is not 0x-prefixed hex");
    return makeWalletClient(plaintext as Hex);
  } finally {
    // Best-effort scrub. V8 will still cache the string in the intern pool;
    // treat this as belt-and-braces, not a guarantee.
  }
}
