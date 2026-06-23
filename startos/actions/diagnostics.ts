import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Per-share diagnostic logging on the pool's mining.submit path.
//
// For each submitted share the pool can re-validate the header under
// alternate coinbase-mangling hypotheses and log the resulting difficulty
// next to the canonical (= submitted) value. Useful to identify what a
// hobby-miner firmware is actually doing when canonical=0 across the board
// even though the device is hashing happily.
//
// Each toggle in this action enables one hypothesis. Leave them all off in
// normal operation. Switch on only what you're currently investigating —
// every enabled mode adds one re-validation pass per share and a `code=diff`
// field to the [diag] log line.
//
// A restart of the Elektron Net Pool service is required for any change to
// take effect (the pool reads .env at startup).
//
// The eight hypotheses, in the same order the pool documents them:
//
//   canonical            no splice (= the value used for the OK/LOW check)
//   suffix-en1           canonical || extranonce1
//   suffix-en1-en2       canonical || extranonce1 || extranonce2 (classic Stratum)
//   suffix-zero4         canonical || 0x00000000   (firmware hardcoded extranonce)
//   suffix-zero8         canonical || 0x0000000000000000
//   prefix-en1           extranonce1 || canonical   (splice at start)
//   suffix-en1-reversed  canonical || byte-reversed extranonce1  (endianness bug)
//   scriptsig-en1        extranonce1 spliced inside vin[0].scriptSig (spec-compliant)
export const inputSpec = InputSpec.of({
  canonical: Value.toggle({
    name: 'canonical',
    description:
      'No splice. Same value the pool uses for the share OK/LOW check. Enable as a baseline so you can see what canonical reports while comparing against the other hypotheses.',
    default: false,
  }),
  'suffix-en1': Value.toggle({
    name: 'suffix-en1',
    description:
      'Append extranonce1 to the end of the canonical coinbase. Classic Stratum splice when the firmware ignores coinb2 and just concatenates.',
    default: false,
  }),
  'suffix-en1-en2': Value.toggle({
    name: 'suffix-en1-en2',
    description:
      'Append extranonce1 || extranonce2. The full classical Stratum coinbase reconstruction.',
    default: false,
  }),
  'suffix-zero4': Value.toggle({
    name: 'suffix-zero4',
    description:
      'Append four zero bytes. Tests firmwares that ignore the wire-level extranonce1 and hardcode 00000000.',
    default: false,
  }),
  'suffix-zero8': Value.toggle({
    name: 'suffix-zero8',
    description: 'Append eight zero bytes.',
    default: false,
  }),
  'prefix-en1': Value.toggle({
    name: 'prefix-en1',
    description:
      'Prepend extranonce1 to the canonical coinbase. Tests for off-position splicing.',
    default: false,
  }),
  'suffix-en1-reversed': Value.toggle({
    name: 'suffix-en1-reversed',
    description:
      'Append extranonce1 with bytes reversed. Tests for big-endian/little-endian parsing bugs.',
    default: false,
  }),
  'scriptsig-en1': Value.toggle({
    name: 'scriptsig-en1',
    description:
      'Splice extranonce1 inside vin[0].scriptSig per Stratum spec (length byte updates with it). The bytes-spec-compliant Stratum behaviour — if THIS one validates, the firmware is doing it right and the pool would have to break UTXO attestation to accept the share.',
    default: false,
  }),
})

const MODES = [
  'canonical',
  'suffix-en1',
  'suffix-en1-en2',
  'suffix-zero4',
  'suffix-zero8',
  'prefix-en1',
  'suffix-en1-reversed',
  'scriptsig-en1',
] as const

export const diagnostics = sdk.Action.withInput(
  'diagnostics',

  async ({ effects }) => ({
    name: 'Diagnostic Logging',
    description:
      'Enable per-share diagnostic logging under one or more coinbase-splice hypotheses. Use to debug hobby-miner share validation; leave every toggle off in normal operation.',
    warning:
      'Each enabled hypothesis adds one extra header re-validation per submitted share and one field to the [diag] log line. Remember to switch everything off again when you are done. A restart of the Elektron Net Pool service is required after changing this.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    const raw = (env?.DIAGNOSTIC_SHARE_LOGGING_MODES ?? '').toLowerCase()
    const enabled = new Set(
      raw.split(',').map((t) => t.trim()).filter((t) => t.length > 0),
    )
    const all = enabled.has('all')
    return MODES.reduce(
      (acc, m) => ({ ...acc, [m]: all || enabled.has(m) }),
      {} as Record<(typeof MODES)[number], boolean>,
    )
  },

  async ({ effects, input }) => {
    const selected = MODES.filter((m) => (input as Record<string, boolean>)[m])
    await envFile.merge(effects, {
      DIAGNOSTIC_SHARE_LOGGING_MODES: selected.join(','),
    })
  },
)
