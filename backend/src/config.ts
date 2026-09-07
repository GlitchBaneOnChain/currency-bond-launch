import { z } from "zod";

/** Treat empty-string env values as unset so `.optional()` on an EVM-address
 * regex behaves the way operators expect. `.env` templates carry blank keys
 * on purpose (fill in later); without this shim they hit the regex and the
 * process refuses to boot. */
const optionalAddress = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().regex(/^0x[a-fA-F0-9]{40}$/, "must be a valid EVM address").optional(),
);

/** Every env var the backend reads flows through this schema exactly once.
 *
 * If a value is missing or malformed the process exits at boot with a clear
 * error — no half-configured worker ever starts consuming jobs. */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  ROBINHOOD_RPC_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  BANKPAD_MASTER_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "BANKPAD_MASTER_KEY must be 32 hex bytes (64 chars)"),
  BANKPAD_MASTER_KEY_VERSION: z.coerce.number().int().min(1).default(1),

  BANKPAD_OPERATOR_ADDRESS: optionalAddress,

  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  CORS_ORIGIN: z
    .string()
    .default("")
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),

  BANKPAD_PAUSE: z
    .enum(["0", "1", "true", "false"])
    .default("0")
    .transform((s) => s === "1" || s === "true"),

  BANKPAD_WETH: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"),

  UNISWAP_V3_NFPM: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3"),
  UNISWAP_V3_SWAP_ROUTER: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0xcaf681a66D020601342297493863e78c959E5cB2"),
  UNISWAP_V3_FACTORY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x1f7d7550B1b028f7571E69A784071F0205FD2EfA"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail loudly at boot rather than let a downstream crash with a stack.
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  // eslint-disable-next-line no-console
  console.error(`Invalid Bankpad backend env:\n${issues}`);
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
export type Config = typeof config;

export const ROBINHOOD_CHAIN_ID = 4663 as const;
