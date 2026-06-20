import { sdk } from './sdk'
import { stratumPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // Single MultiHost so UI and Stratum can share the same (sub)domain
  const multiHost = sdk.MultiHost.of(effects, 'main')

  // UI
  const uiMultiOrigin = await multiHost.bindPort(uiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: 'Web UI',
    id: 'ui',
    description: 'Personal web user interface for Elektron Net Pool',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  // Stratum — plain TCP on 3333, StartOS-terminated TLS on 4333.
  const stratumMultiOrigin = await multiHost.bindPort(stratumPort, {
    protocol: null,
    addSsl: {
      preferredExternalPort: 4333,
      alpn: null,
      addXForwardedHeaders: false,
      auth: null,
    },
    preferredExternalPort: stratumPort,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: 'Stratum Server',
    id: 'stratum',
    description: 'Your Stratum server',
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const stratumReceipt = await stratumMultiOrigin.export([stratum])

  return [uiReceipt, stratumReceipt]
})
