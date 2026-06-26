import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.2:1',
  releaseNotes: {
    en_US: 'Elektron Net Pool on StartOS, v.4.0.2:1',
    de_DE: 'Elektron Net Pool auf StartOS, v.4.0.2:1',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
