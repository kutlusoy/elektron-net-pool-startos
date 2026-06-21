import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.1:3',
  releaseNotes: {
    en_US: 'Initial release of Elektron Net Pool on StartOS.',
    de_DE: 'Erstveröffentlichung von Elektron Net Pool auf StartOS.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
