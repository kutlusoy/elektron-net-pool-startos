import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Defaults match elektron-net-pool's .env.example. RPC fields default to empty;
// the user fills them in via the Configure action (no StartOS-native Elektron
// Net package exists yet to wire automatically).
const shape = z.object({
  ELEKTRON_RPC_URL: z.string().catch(''),
  ELEKTRON_RPC_USER: z.string().catch(''),
  ELEKTRON_RPC_PASSWORD: z.string().catch(''),
  ELEKTRON_RPC_PORT: z.string().catch('8332'),
  ELEKTRON_RPC_TIMEOUT: z.string().catch('10000'),
  ELEKTRON_RPC_COOKIEFILE: z.string().catch(''),
  ELEKTRON_ZMQ_HOST: z.string().catch(''),
  API_PORT: z.literal('3334').catch('3334'),
  STRATUM_PORT: z.literal('3333').catch('3333'),
  STRATUM_MAX_CONNECTIONS_PER_LISTENER: z.string().catch('10000'),
  API_SECURE: z.literal('false').catch('false'),
  POOL_IDENTIFIER: z.string().catch('Elektron-Pool on StartOS'),
  NETWORK: z.enum(['mainnet', 'regtest']).catch('mainnet'),
  DEV_FEE_ADDRESS: z.string().catch(''),
  // Hobby-miner allow-list. Comma-separated userAgent substrings
  // (case-insensitive). Matching sessions are treated as needing the
  // NerdMiner-style compatibility mode: non-empty extranonce1 in the
  // subscribe response so the firmware does not abort, plus a low starting
  // difficulty. Compliant firmwares (Bitaxe ESP-Miner, Antminer,
  // Whatsminer) must NOT be on this list — they need empty extranonce1 to
  // produce valid shares against the canonical coinbase. Mirrors the
  // pool's .env.example.
  HOBBY_MINER_USER_AGENTS: z
    .string()
    .catch('NerdMiner,NerdminerV2,nerdminer,NerdAxe,NerdQAxe'),
  HOBBY_MINER_DIFFICULTY: z.string().catch('0.001'),
  // Per-share diagnostic logging. Comma-separated list of header-
  // reconstruction hypotheses; empty disables all diagnostic output.
  // Operator-facing Diagnostic Logging action edits this string.
  DIAGNOSTIC_SHARE_LOGGING_MODES: z.string().catch(''),
})

export type EnvType = z.infer<typeof shape>

export const envFile = FileHelper.env(
  {
    base: sdk.volumes.main,
    subpath: '.env',
  },
  shape,
)
