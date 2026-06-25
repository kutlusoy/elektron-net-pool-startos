import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value, List } = sdk

// Operator-facing controls for the pool's hobby-miner compatibility mode.
//
// HOBBY_MINER_USER_AGENTS is a comma-separated allow-list (case-insensitive
// substring match) of mining.subscribe userAgent strings. Sessions whose
// userAgent matches any entry are served the HOBBY subscribe response —
// non-empty extranonce1 so the firmware does not abort on connect — and
// HOBBY_MINER_DIFFICULTY as their starting share difficulty.
//
// Compliant firmwares (Bitaxe ESP-Miner, Antminer, Whatsminer, BraiinsOS,
// cpuminer) must NOT be on this list: they require the canonical NORMAL
// subscribe response (extranonce1 = "", extranonce2_size = 0) to produce
// shares that validate against the pool's coinbase. Putting them in HOBBY
// makes them connect but produce zero valid shares.
//
// Defaults mirror the pool's .env.example: the NerdMiner_v2 family.
//
// A restart of the Elektron Net Pool service is required for any change to
// take effect (the pool reads .env at startup).

const ENV_KEY = 'HOBBY_MINER_USER_AGENTS'
const DIFFICULTY_KEY = 'HOBBY_MINER_DIFFICULTY'

const DEFAULT_AGENTS = [
  'NerdMiner',
  'NerdminerV2',
  'nerdminer',
  'NerdAxe',
  'NerdQAxe',
]

function parseAgents(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export const inputSpec = InputSpec.of({
  userAgents: Value.list(
    List.text(
      {
        name: 'Hobby Miner User Agents',
        description:
          'List of mining.subscribe userAgent substrings (case-insensitive) that should be served the HOBBY subscribe response. Add the userAgent string a firmware reports (e.g. "NerdMiner", "NerdQAxe") and it will receive a non-empty extranonce1 so it does not abort on connect, plus the low Hobby Miner Difficulty below as its starting share difficulty. Do NOT add Bitaxe / ESP-Miner / Antminer / Whatsminer here — those need the canonical NORMAL response to produce valid shares.',
        default: DEFAULT_AGENTS,
      },
      {
        inputmode: 'text',
        patterns: [
          {
            regex: '^[^,]+$',
            description:
              'Any non-empty string without a comma. Commas are reserved as separators when the list is serialised into the .env file.',
          },
        ],
      },
    ),
  ),
  difficulty: Value.number({
    name: 'Hobby Miner Difficulty',
    description:
      'Starting share difficulty for sessions matched by the user-agent list above. ESP32-class miners (NerdMiner) need values around 0.001 to find any shares inside the dead-client timeout; raise carefully if you have faster hobby hardware.',
    required: true,
    default: 0.001,
    min: 0.00001,
    integer: false,
  }),
})

export const hobbyMiners = sdk.Action.withInput(
  'hobby-miners',

  async ({ effects }) => ({
    name: 'Hobby Miner Compatibility',
    description:
      'Edit the user-agent allow-list for HOBBY-mode sessions and the starting difficulty served to them. See the field descriptions for which firmwares belong here and which do not.',
    warning:
      'A restart of the Elektron Net Pool service is required for changes to take effect. Adding a compliant ASIC firmware (Bitaxe, Antminer, Whatsminer) here will break its shares — only add firmwares that need the NerdMiner-style subscribe workaround.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    const agents = parseAgents(env?.[ENV_KEY])
    const rawDiff = env?.[DIFFICULTY_KEY]
    const diff = rawDiff ? Number(rawDiff) : 0.001
    return {
      userAgents: agents.length > 0 ? agents : DEFAULT_AGENTS,
      difficulty: Number.isFinite(diff) ? diff : 0.001,
    }
  },

  async ({ effects, input }) => {
    const cleaned = (input.userAgents ?? [])
      .map((s) => (s ?? '').trim())
      .filter((s) => s.length > 0 && !s.includes(','))
    await envFile.merge(effects, {
      [ENV_KEY]: cleaned.join(','),
      [DIFFICULTY_KEY]: String(input.difficulty),
    })
  },
)
