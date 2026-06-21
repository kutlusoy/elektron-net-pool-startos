import { sdk } from '../sdk'

// Wipes the pool's SQLite database in the `mainnet` volume subpath. This
// clears Found Blocks, client stats, shares and address-settings history —
// useful after development churn or to drop entries that were recorded by
// the pre-fix pool when rejected submissions were still persisted.
//
// StartOS service logs (the live tail in the UI) are not stored in the
// volume; they live in StartOS's own log store. Clear those from the UI's
// Logs page if needed.
//
// The action requires the service to be stopped so the SQLite file is not
// open while we delete it.
const DB_FILES = [
  'public-pool.sqlite',
  'public-pool.sqlite-wal',
  'public-pool.sqlite-shm',
  'public-pool.sqlite-journal',
]

export const resetDatabase = sdk.Action.withoutInput(
  'reset-database',

  async ({ effects }) => ({
    name: 'Reset Database',
    description:
      'Delete the pool SQLite database (Found Blocks, client stats, shares). The service must be stopped first. Service logs are unaffected — clear them from the Logs page.',
    warning:
      'This permanently deletes every recorded block, client, share and address-settings row. There is no undo. Make sure the pool is stopped before running this action.',
    allowedStatuses: 'only-stopped',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const sub = await sdk.SubContainer.of(
      effects,
      { imageId: 'elektron-net-pool' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: 'mainnet',
        mountpoint: '/data',
        readonly: false,
      }),
      'reset-database',
    )

    try {
      // Use individual unlinks instead of a glob so we don't depend on the
      // shell expanding `*.sqlite*` patterns; some minimal images strip
      // /bin/sh wildcards.
      const args = DB_FILES.map((f) => `/data/${f}`)
      await sub.exec(['sh', '-c', `rm -f ${args.map((a) => `'${a}'`).join(' ')}`])
    } finally {
      await sub.destroy?.()
    }

    return {
      version: '1' as const,
      title: 'Database reset',
      message:
        'The pool database has been wiped. Start the service to begin with a clean Found Blocks table and zero stats.',
      result: null,
    }
  },
)
