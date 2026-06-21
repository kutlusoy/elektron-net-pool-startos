import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Where the user enters the connection details for the Elektron Net full node.
//
// Recommended setup: install the StartOS-native `elektrond` package
// (https://github.com/kutlusoy/elektron-net-startos) on the same StartOS host.
// The pool then reaches it over the internal Docker network at
//   http://elektrond.startos:8332    (RPC)
//   tcp://elektrond.startos:28332    (ZMQ, optional)
// Hostname format depends on StartOS version: `elektrond.startos` on 0.3.6+,
// `elektrond.embassy` on 0.3.5. See the package's RPC Interface page in the
// StartOS UI for the exact address.
export const inputSpec = InputSpec.of({
  ELEKTRON_RPC_URL: Value.text({
    name: 'Elektron Node RPC URL',
    description:
      'Base URL of the Elektron Net node. For a local elektrond on the same StartOS, use http://elektrond.startos (StartOS 0.3.6+) or http://elektrond.embassy (0.3.5). For a remote node behind a VPN, use the tunnel IP, e.g. http://10.0.0.5.',
    required: true,
    default: 'http://elektrond.startos',
    placeholder: 'http://elektrond.startos',
  }),
  ELEKTRON_RPC_PORT: Value.text({
    name: 'Elektron Node RPC Port',
    description: 'RPC port of the Elektron Net node (8332 by default)',
    required: true,
    default: '8332',
    placeholder: '8332',
    patterns: [{ regex: '^[0-9]+$', description: 'Must be a port number' }],
  }),
  ELEKTRON_RPC_USER: Value.text({
    name: 'Elektron Node RPC User',
    description:
      'RPC username. Generate an rpcauth entry in Elektron Net (Configure -> RPC) and use the chosen username here.',
    required: false,
    default: null,
    placeholder: '',
  }),
  ELEKTRON_RPC_PASSWORD: Value.text({
    name: 'Elektron Node RPC Password',
    description:
      'RPC password matching the rpcauth entry in Elektron Net.',
    required: false,
    default: null,
    placeholder: '',
    masked: true,
  }),
  ELEKTRON_RPC_COOKIEFILE: Value.text({
    name: 'Elektron Node RPC Cookie File',
    description:
      'Optional path to the Elektron Net node .cookie file (alternative to user/password). Only usable when the pool can mount the elektrond volume — normally leave empty and use user/password instead.',
    required: false,
    default: null,
    placeholder: '',
  }),
  ELEKTRON_RPC_TIMEOUT: Value.text({
    name: 'Elektron Node RPC Timeout (ms)',
    description: 'RPC request timeout in milliseconds',
    required: true,
    default: '10000',
    placeholder: '10000',
    patterns: [{ regex: '^[0-9]+$', description: 'Must be a number' }],
  }),
  ELEKTRON_ZMQ_HOST: Value.text({
    name: 'Elektron Node ZMQ Host',
    description:
      'Optional ZMQ endpoint, enables push notifications for new blocks. For a local elektrond, use tcp://elektrond.startos:28332.',
    required: false,
    default: null,
    placeholder: 'tcp://elektrond.startos:28332',
  }),
  NETWORK: Value.select({
    name: 'Network',
    description: 'Which Elektron Net network the pool runs on',
    default: 'mainnet',
    values: {
      mainnet: 'mainnet',
      regtest: 'regtest',
    },
  }),
})

export const elektronRpc = sdk.Action.withInput(
  'elektron-rpc',

  async ({ effects }) => ({
    name: 'Elektron Node RPC',
    description: 'Connect Elektron Net Pool to your Elektron Net full node',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    return {
      ELEKTRON_RPC_URL: env?.ELEKTRON_RPC_URL || undefined,
      ELEKTRON_RPC_PORT: env?.ELEKTRON_RPC_PORT,
      ELEKTRON_RPC_USER: env?.ELEKTRON_RPC_USER || null,
      ELEKTRON_RPC_PASSWORD: env?.ELEKTRON_RPC_PASSWORD || null,
      ELEKTRON_RPC_COOKIEFILE: env?.ELEKTRON_RPC_COOKIEFILE || null,
      ELEKTRON_RPC_TIMEOUT: env?.ELEKTRON_RPC_TIMEOUT,
      ELEKTRON_ZMQ_HOST: env?.ELEKTRON_ZMQ_HOST || null,
      NETWORK: env?.NETWORK,
    }
  },

  async ({ effects, input }) => {
    await envFile.merge(effects, {
      ELEKTRON_RPC_URL: input.ELEKTRON_RPC_URL,
      ELEKTRON_RPC_PORT: input.ELEKTRON_RPC_PORT,
      ELEKTRON_RPC_USER: input.ELEKTRON_RPC_USER ?? '',
      ELEKTRON_RPC_PASSWORD: input.ELEKTRON_RPC_PASSWORD ?? '',
      ELEKTRON_RPC_COOKIEFILE: input.ELEKTRON_RPC_COOKIEFILE ?? '',
      ELEKTRON_RPC_TIMEOUT: input.ELEKTRON_RPC_TIMEOUT,
      ELEKTRON_ZMQ_HOST: input.ELEKTRON_ZMQ_HOST ?? '',
      NETWORK: input.NETWORK,
    })
  },
)
