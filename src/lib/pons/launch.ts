import {
  decodeEventLog,
  encodeAbiParameters,
  keccak256,
  type Address,
  type Hex,
  type WalletClient,
} from "viem";
import { getPublicClient } from "@/lib/chain/clients";
import { rewardCurrency } from "@/lib/registry/reward-currencies";
import {
  ponsV1FactoryAbi,
  PONS_V1_FACTORY_ADDRESS,
  type LauncherTokenParams,
} from "./factory-v1";

/** Arguments the UI collects before signing a launch. `rewardCurrencyCode`
 * is the immutable choice of national currency holders will earn. */
export type LaunchInput = {
  name: string;
  symbol: string;
  logo: string; // IPFS URI or https URL
  description: string;
  socials: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
    farcaster?: string;
  };
  /** Address that will collect the V3 position's trading fees. In the
   * automation-friendly setup this is the Bankpad distributor contract; in
   * the self-custody setup it is the creator's own wallet. */
  feeWallet: Address;
  rewardCurrencyCode: string;
  /** V1 factory launch config id (fee tier, tick range, etc). Defaults to 0. */
  launchConfigId?: bigint;
  /** V1 factory DEX id. Defaults to 0. */
  dexId?: bigint;
  /** Deterministic seed for the CREATE2 salt. Defaults to a random 32 bytes. */
  saltSeed?: string;
};

/** Result of a successful launch: the deployed token address plus the raw
 * `TokenLaunched` event for downstream indexing. */
export type LaunchResult = {
  token: Address;
  pool: Address;
  positionId: bigint;
  restrictionsEndBlock: bigint;
  txHash: Hex;
};

function randomSalt(seed?: string): Hex {
  const source = seed ?? `${Date.now()}-${Math.random()}`;
  return keccak256(
    encodeAbiParameters([{ type: "string" }, { type: "string" }], ["bankpad-salt", source]),
  );
}

/** Read the current launch fee from the V1 factory (ETH, wei). */
export async function readLaunchFee(): Promise<bigint> {
  return getPublicClient().readContract({
    address: PONS_V1_FACTORY_ADDRESS,
    abi: ponsV1FactoryAbi,
    functionName: "launchFee",
  }) as Promise<bigint>;
}

/** Broadcast a launch through the V1 factory using the caller's wallet.
 *
 * The reward currency selection is validated against the on-chain allowlist
 * before we ever ask the wallet to sign — a client-supplied unlisted currency
 * is rejected here, and the backend re-checks pool depth before publishing
 * the launch to the site. */
export async function launchTokenTx(
  wallet: WalletClient,
  input: LaunchInput,
): Promise<LaunchResult> {
  const currency = rewardCurrency(input.rewardCurrencyCode);
  if (!currency) {
    throw new Error(`Reward currency ${input.rewardCurrencyCode} is not on the allowlist`);
  }

  const params: LauncherTokenParams = {
    name: input.name,
    symbol: input.symbol,
    logo: input.logo,
    description: input.description,
    feeWallet: input.feeWallet,
    socials: {
      twitter: input.socials.twitter ?? "",
      telegram: input.socials.telegram ?? "",
      discord: input.socials.discord ?? "",
      website: input.socials.website ?? "",
      farcaster: input.socials.farcaster ?? "",
    },
  };

  const salt = randomSalt(input.saltSeed);
  const launchFee = await readLaunchFee();
  const account = wallet.account;
  if (!account) throw new Error("Wallet has no active account");

  const publicClient = getPublicClient();

  // Simulate first so a bad param surfaces as a proper revert reason
  // instead of a signed-and-broadcast failure.
  const { request } = await publicClient.simulateContract({
    account,
    address: PONS_V1_FACTORY_ADDRESS,
    abi: ponsV1FactoryAbi,
    functionName: "launchToken",
    args: [params, input.launchConfigId ?? 0n, input.dexId ?? 0n, salt],
    value: launchFee,
  });

  const txHash = await wallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== PONS_V1_FACTORY_ADDRESS.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({
        abi: ponsV1FactoryAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "TokenLaunched") {
        const args = decoded.args as {
          token: Address;
          pool: Address;
          positionId: bigint;
          restrictionsEndBlock: bigint;
        };
        return {
          token: args.token,
          pool: args.pool,
          positionId: args.positionId,
          restrictionsEndBlock: args.restrictionsEndBlock,
          txHash,
        };
      }
    } catch {
      // Not a TokenLaunched log, keep scanning.
    }
  }

  throw new Error("Launch transaction confirmed but the TokenLaunched event was not found");
}
