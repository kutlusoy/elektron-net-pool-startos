import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.5:1',
  releaseNotes: {
    en_US:
      'Elektron Net Pool on StartOS, v.4.0.5:1. Configure now exposes Pool URL and Mempool Registry URL (network-wide block attribution); Performance Tuning gained a Work Refresh Interval control and corrected defaults to match the pool.',
    de_DE:
      'Elektron Net Pool auf StartOS, v.4.0.5:1. "Konfigurieren" bietet jetzt Pool-URL und Mempool-Registry-URL (netzwerkweite Blockzuordnung); "Performance-Tuning" hat einen neuen Work-Refresh-Intervall-Regler und korrigierte Standardwerte passend zum Pool.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
