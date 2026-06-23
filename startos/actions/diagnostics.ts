import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Operator-facing toggle for the per-share diagnostic log line emitted by
// the pool (`[diag] canonical=... altSpliced=... altBaseline=... en1=... en2=...`).
//
// Off by default. Flip on when investigating hobby-miner share-validation
// quirks (e.g. NerdMiner V2 < 1.8.3 splicing extranonce1 into the coinbase),
// then flip back off — leaving it on doubles the per-share log volume.
//
// The pool reads .env at startup, so changes take effect on the next restart
// of the Elektron Net Pool service.
export const inputSpec = InputSpec.of({
  DIAGNOSTIC_SHARE_LOGGING: Value.toggle({
    name: 'Per-share diagnostic logging',
    description:
      'When ON, every mining.submit is followed by a [diag] line that re-validates the share under three header hypotheses (canonical coinbase, with extranonce1 spliced, sanity baseline). Useful for debugging hobby-miner firmwares that mishandle extranonce1. Off by default — very chatty when on. A restart of the Elektron Net Pool service is required for the change to take effect.',
    default: false,
  }),
})

export const diagnostics = sdk.Action.withInput(
  'diagnostics',

  async ({ effects }) => ({
    name: 'Diagnostic Logging',
    description:
      'Toggle the per-share diagnostic log line on or off. Use when investigating hobby-miner share-validation issues; leave off in normal operation.',
    warning:
      'Turning this on roughly doubles the log volume per submitted share. Remember to turn it back off when you are done.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    return {
      DIAGNOSTIC_SHARE_LOGGING: env?.DIAGNOSTIC_SHARE_LOGGING === 'true',
    }
  },

  async ({ effects, input }) => {
    await envFile.merge(effects, {
      DIAGNOSTIC_SHARE_LOGGING: input.DIAGNOSTIC_SHARE_LOGGING ? 'true' : 'false',
    })
  },
)
