import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Operator-facing performance knobs for the Stratum service.
//
// JOB_REFRESH_INTERVAL_MS — how often each connected miner gets a fresh
// mining.notify with an advanced ntime. Lower (e.g. 5000 ms) for hardware
// that exhausts the (nonce, version) search space inside one ntime window
// (Bitaxe Gamma, modern S-series Antminer). The refresh sets clearJobs=false
// between block heights, so it does not invalidate in-flight work — it only
// makes the timestamp advance. Raise to relieve a strained upstream node.
//
// DIFFICULTY_CHECK_INTERVAL_MS — how often the per-session vardiff
// re-evaluates the share submission rate and bumps share difficulty toward
// the 10 shares/sec target.
//
// A restart of the Elektron Net Pool service is required for any change to
// take effect (the pool reads .env at startup).

const JOB_REFRESH_KEY = 'JOB_REFRESH_INTERVAL_MS'
const DIFFICULTY_CHECK_KEY = 'DIFFICULTY_CHECK_INTERVAL_MS'

const DEFAULT_JOB_REFRESH_MS = 30000
const DEFAULT_DIFFICULTY_CHECK_MS = 60000

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const parsed = parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

export const inputSpec = InputSpec.of({
  jobRefreshMs: Value.number({
    name: 'Job Refresh Interval (ms)',
    description:
      'How often each connected miner receives a fresh mining.notify with an advanced ntime. Lower values (5000–10000 ms) help high-end ASICs (Bitaxe Gamma, Antminer S21) keep their nonce search window fresh. The refresh does not clear in-flight jobs between block heights, so a faster cadence is safe — it costs one extra getblocktemplate per miner per tick. Hard floor 1000 ms.',
    required: true,
    default: DEFAULT_JOB_REFRESH_MS,
    min: 1000,
    max: 600000,
    step: 1000,
    integer: true,
    units: 'ms',
  }),
  difficultyCheckMs: Value.number({
    name: 'Vardiff Check Interval (ms)',
    description:
      'How often the per-session vardiff re-evaluates submission rate and adjusts share difficulty toward the 10 shares/sec target. Hard floor 5000 ms.',
    required: true,
    default: DEFAULT_DIFFICULTY_CHECK_MS,
    min: 5000,
    max: 600000,
    step: 1000,
    integer: true,
    units: 'ms',
  }),
})

export const performance = sdk.Action.withInput(
  'performance',

  async ({ effects }) => ({
    name: 'Performance Tuning',
    description:
      'Tune the Stratum template push and vardiff cadences. Lower the Job Refresh Interval for high-end ASICs that exhaust a single ntime window quickly; raise it to relieve a strained Elektron Net node.',
    warning:
      'A restart of the Elektron Net Pool service is required for changes to take effect. Very low Job Refresh values multiply your upstream getblocktemplate load by the number of connected miners.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    return {
      jobRefreshMs: parsePositiveInt(env?.[JOB_REFRESH_KEY], DEFAULT_JOB_REFRESH_MS),
      difficultyCheckMs: parsePositiveInt(
        env?.[DIFFICULTY_CHECK_KEY],
        DEFAULT_DIFFICULTY_CHECK_MS,
      ),
    }
  },

  async ({ effects, input }) => {
    await envFile.merge(effects, {
      [JOB_REFRESH_KEY]: String(input.jobRefreshMs),
      [DIFFICULTY_CHECK_KEY]: String(input.difficultyCheckMs),
    })
  },
)
