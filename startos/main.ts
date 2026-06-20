import { sdk } from './sdk'
import { stratumPort, uiPort } from './utils'
import { store } from './file-models/store.json'
import { i18n } from './i18n'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info('Starting Elektron Net Pool!')

  const depResult = await sdk.checkDependencies(effects)
  depResult.throwIfNotSatisfied()

  // ** Stratum subcontainer **
  const stratumSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'elektron-net-pool' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: 'mainnet',
        mountpoint: '/elektron-pool/DB',
        readonly: false,
      })
      .mountVolume({
        volumeId: 'main',
        subpath: '.env',
        mountpoint: '/elektron-pool/.env',
        readonly: true,
        type: 'file',
      }),
    'stratum',
  )

  // ** UI subcontainer **
  const uiSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'elektron-net-pool' },
    null,
    'ui',
  )

  // Bake the user-selected Stratum display URLs into the UI bundle. The
  // placeholders come from assets/patches/environment.prod.ts.
  const storeData = await store.read().const(effects)
  const url = storeData?.stratumDisplayAddress || ''
  const secureUrl = storeData?.secureStratumDisplayAddress || ''

  await uiSub.exec([
    'sh',
    '-c',
    `sed -i "s|<Stratum URL>|${url}|; s|<Secure Stratum URL>|${secureUrl}|" "$(find /var/www/html/main.*.js)"`,
  ])

  return sdk.Daemons.of(effects)
    .addDaemon('stratum', {
      subcontainer: stratumSub,
      exec: {
        command: ['/usr/local/bin/node', 'dist/main.js'],
        cwd: '/elektron-pool',
      },
      ready: {
        display: i18n('Stratum Server'),
        gracePeriod: 15_000,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, stratumPort, {
            successMessage: i18n('Stratum server is ready'),
            errorMessage: i18n('Stratum server is not ready'),
          }),
      },
      requires: [],
    })
    .addDaemon('ui', {
      subcontainer: uiSub,
      exec: {
        command: ['nginx', '-g', 'daemon off;'],
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: [],
    })
})
