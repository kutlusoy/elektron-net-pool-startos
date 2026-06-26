import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Controls the pool's built-in daily log rotation. Logs are written to
// pool-YYYY-MM-DD.log inside the main DB volume's "logs" subdirectory and
// pruned every night so disk usage stays bounded. A retention of 0 disables
// pruning entirely (useful if the operator wants to keep an archive).
export const inputSpec = InputSpec.of({
  LOG_RETENTION_DAYS: Value.number({
    name: 'Log Retention (days)',
    description:
      'How many days of pool log files to keep on disk. Older daily rotation files are deleted at midnight UTC. Set to 0 to disable automatic pruning.',
    required: true,
    default: 7,
    integer: true,
    min: 0,
    max: 365,
  }),
})

export const logRetention = sdk.Action.withInput(
  'log-retention',

  async ({ effects }) => ({
    name: 'Log Retention',
    description:
      'Configure how long the pool keeps its daily-rotated log files before deleting them.',
    warning:
      'A restart of the Elektron Net Pool service is required for the new retention window to take effect.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    const parsed = parseInt(env?.LOG_RETENTION_DAYS ?? '7', 10)
    return {
      LOG_RETENTION_DAYS: Number.isFinite(parsed) && parsed >= 0 ? parsed : 7,
    }
  },

  async ({ effects, input }) => {
    await envFile.merge(effects, {
      LOG_RETENTION_DAYS: String(input.LOG_RETENTION_DAYS),
    })
  },
)
