import { autoconfig } from 'elektron-net-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'

// The pool needs an Elektron Net full node (RPC + ZMQ) to subscribe to new
// block events and submit found blocks. The StartOS-native node lives at
// https://github.com/kutlusoy/elektron-net-startos (package id `elektrond`).
//
// Declared as optional in manifest/index.ts so the pool can also point at a
// remote node via the `elektron-rpc` action. When `elektrond` *is* installed
// locally we still want StartOS to enforce that it is running before the pool
// is considered healthy and that ZMQ is enabled on it (the pool subscribes
// to ZMQ for new-block events).
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // Mirrors public-pool-startos -> bitcoin-core-startos: schedules a
  // critical task that flips `zmqEnabled` on the elektrond config whenever
  // it is not already enabled. The `as any` cast is the same workaround the
  // upstream uses for cross-package SDK version drift.
  await sdk.action.createTask(
    effects,
    'elektrond',
    autoconfig as any,
    'critical',
    {
      input: { kind: 'partial', value: { zmqEnabled: true } },
      reason: 'Must enable ZMQ in Elektron Net to use it with the pool',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  return {
    elektrond: {
      kind: 'running',
      versionRange: '>=0',
      healthChecks: [],
    },
  }
})
