import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.0.6:1',
  releaseNotes: {
    en_US:
      'Elektron Net Pool on StartOS, v.4.0.6:1. Security update: the web interface image is now based on Debian trixie, which ships the patched nginx 1.26.3 (fixes for the October 2026 nginx advisories).',
    de_DE:
      'Elektron Net Pool auf StartOS, v.4.0.6:1. Sicherheitsupdate: Das Image der Weboberfläche basiert jetzt auf Debian trixie mit dem gepatchten nginx 1.26.3 (Korrekturen zu den nginx-Sicherheitshinweisen vom Oktober 2026).',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
