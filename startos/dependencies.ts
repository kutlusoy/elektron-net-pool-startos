import { sdk } from './sdk'

// The pool needs an Elektron Net full node to subscribe to new block events
// and submit found blocks. By default we require the StartOS-native
// `elektrond` package (https://github.com/kutlusoy/elektron-net-startos).
//
// Users who want to connect to a *remote* Elektron Net node instead can
// switch `optional` to `true` in manifest/index.ts and return `{}` here
// — the existing `elektron-rpc` action keeps supporting external RPC URLs.
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    elektrond: {
      kind: 'running',
      versionRange: '>=0',
      healthChecks: [],
    },
  }
})
