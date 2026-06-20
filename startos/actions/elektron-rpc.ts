import { sdk } from '../sdk'
import { envFile } from '../file-models/env'

const { InputSpec, Value } = sdk

// Where the user enters the connection details for the Elektron Net full node.
// Since there is no StartOS-native package for Elektron Net yet, this cannot be
// wired automatically the way Public Pool wires Bitcoin Core.
export const inputSpec = InputSpec.of({
  ELEKTRON_RPC_URL: Value.text({
    name: 'Elektron Node RPC URL',
    description:
      'Base URL of the Elektron Net node, e.g. http://192.168.1.100 or http://host.docker.internal',
    required: true,
    default: 'http://192.168.1.100',
    placeholder: 'http://192.168.1.100',
  }),
  ELEKTRON_RPC_PORT: Value.text({
    name: 'Elektron Node RPC Port',
    description: 'RPC port of the Elektron Net node',
    required: true,
    default: '8332',
    placeholder: '8332',
    patterns: [{ regex: '^[0-9]+$', description: 'Must be a port number' }],
  }),
  ELEKTRON_RPC_USER: Value.text({
    name: 'Elektron Node RPC User',
    description:
      'RPC username. Leave empty if you use a cookie file instead.',
    required: false,
    default: null,
    placeholder: '',
  }),
  ELEKTRON_RPC_PASSWORD: Value.text({
    name: 'Elektron Node RPC Password',
    description:
      'RPC password. Leave empty if you use a cookie file instead.',
    required: false,
    default: null,
    placeholder: '',
    masked: true,
  }),
  ELEKTRON_RPC_COOKIEFILE: Value.text({
    name: 'Elektron Node RPC Cookie File',
    description:
      'Path to the Elektron Net node .cookie file (alternative to user/password)',
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
      'Optional ZMQ endpoint, e.g. tcp://192.168.1.100:3000. Enables push notifications for new blocks.',
    required: false,
    default: null,
    placeholder: 'tcp://192.168.1.100:3000',
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
