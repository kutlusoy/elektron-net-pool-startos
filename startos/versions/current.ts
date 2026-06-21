import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.3',
  releaseNotes: {
    en_US: 'Elektron Net Pool on StartOS.',
    de_DE: 'Elektron Net Pool auf StartOS.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
