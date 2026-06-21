import { sdk } from './sdk'

// The pool needs an Elektron Net full node (RPC + optional ZMQ) to subscribe
// to new block events and submit found blocks. The StartOS-native node lives
// at https://github.com/kutlusoy/elektron-net-startos (package id `elektrond`).
//
// Declared as optional in manifest/index.ts so the pool can also point at a
// remote node via the `elektron-rpc` action. When `elektrond` *is* installed
// locally we still want StartOS to enforce that it is running before the pool
// is considered healthy; any version is accepted.
//
// TODO: once kutlusoy/elektron-net-startos adds a `"name"` field to its
// package.json (currently missing), wire up the ZMQ auto-configuration the
// same way upstream public-pool-startos does for Bitcoin:
//
//   import { autoconfig } from 'elektron-net-startos/startos/actions/config/autoconfig'
//   await sdk.action.createTask(effects, 'elektrond', autoconfig as any, 'critical', {
//     input: { kind: 'partial', value: { zmqEnabled: true } },
//     reason: 'Must enable ZMQ in Elektron Net to use it with the pool',
//     when: { condition: 'input-not-matches', once: false },
//   })
//
// That requires adding elektron-net-startos as a (git) dependency in this
// repo's package.json, which only resolves cleanly once it is a named package.
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {
    elektrond: {
      kind: 'running',
      versionRange: '>=0',
      healthChecks: [],
    },
  }
})
