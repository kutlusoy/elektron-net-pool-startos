import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { utils } from '@start9labs/start-sdk'
import { store } from '../file-models/store.json'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  POOL_IDENTIFIER: Value.text({
    name: 'Pool Identifier',
    description:
      'The pool name returned by the GET /pool/identity endpoint for the dashboard and reported to every mempool explorer instance known from the registry below, so blocks this pool finds get attributed to it network-wide. Never written into the coinbase -- any extra coinbase output would invalidate the per-block UTXO attestation.',
    required: true,
    default: 'Elektron Pool on StartOS',
    placeholder: 'Elektron Pool on StartOS',
    maxLength: 100,
    patterns: [utils.Patterns.ascii],
  }),
  POOL_URL: Value.text({
    name: 'Pool URL',
    description:
      'Optional public URL for this pool, returned by GET /pool/identity alongside the Pool Identifier and used the same way for network-wide block attribution.',
    required: false,
    default: null,
    placeholder: 'https://solopool3.elektron-net.org',
  }),
  MEMPOOL_REGISTRY_URL: Value.text({
    name: 'Mempool Registry URL',
    description:
      'Base URL of the shared elektron-net-registry repo (raw file content, no trailing slash) used to discover known mempool explorer instances to report found blocks to. Leave empty to use the official registry, which is already the built-in default -- only set this if you run your own fork of the registry.',
    required: false,
    default: 'https://raw.githubusercontent.com/kutlusoy/elektron-net-registry/main',
    placeholder:
      'https://raw.githubusercontent.com/kutlusoy/elektron-net-registry/main',
  }),
  poolDisplayUrl: Value.dynamicSelect(async ({ effects }) => {
    const urls = await sdk.serviceInterface
      .getOwn(effects, 'stratum', (iface) => {
        const addrs = iface?.addressInfo?.filter({
          kind: ['domain', 'ipv4', 'mdns'],
          exclude: { kind: ['localhost', 'link-local', 'bridge'] },
          predicate: (h) => !h.ssl,
        })
        return [
          ...(addrs?.filter({ kind: 'mdns' })?.format() || []),
          ...(addrs?.filter({ exclude: { kind: 'mdns' } })?.format() || []),
        ]
      })
      .const()

    return {
      name: 'Server Display URL',
      description:
        'The IP address or hostname to show on your Elektron Net Pool homepage',
      values: urls.reduce(
        (obj, url) => ({
          ...obj,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: urls[0],
    }
  }),
  securePoolDisplayUrl: Value.dynamicSelect(async ({ effects }) => {
    const urls = await sdk.serviceInterface
      .getOwn(effects, 'stratum', (iface) => {
        const addrs = iface?.addressInfo?.filter({
          kind: ['domain', 'ipv4', 'mdns'],
          exclude: { kind: ['localhost', 'link-local', 'bridge'] },
          predicate: (h) => h.ssl,
        })
        return [
          ...(addrs?.filter({ kind: 'mdns' })?.format() || []),
          ...(addrs?.filter({ exclude: { kind: 'mdns' } })?.format() || []),
        ]
      })
      .const()

    return {
      name: 'Secure Server Display URL',
      description:
        'The IP address or hostname to show on your Elektron Net Pool homepage for TLS (stratum+tls) connections',
      values: urls.reduce(
        (obj, url) => ({
          ...obj,
          [url]: url,
        }),
        {} as Record<string, string>,
      ),
      default: urls[0],
    }
  }),
})

export const config = sdk.Action.withInput(
  'config',

  async ({ effects }) => ({
    name: 'Configure',
    description: 'Customize your Elektron Net Pool instance',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const env = await envFile.read().once()
    return {
      POOL_IDENTIFIER: env?.POOL_IDENTIFIER,
      POOL_URL: env?.POOL_URL || null,
      MEMPOOL_REGISTRY_URL: env?.MEMPOOL_REGISTRY_URL || null,
      poolDisplayUrl:
        (await store.read((s) => s.stratumDisplayAddress).once()) || undefined,
      securePoolDisplayUrl:
        (await store.read((s) => s.secureStratumDisplayAddress).once()) ||
        undefined,
    }
  },

  async ({ effects, input }) => {
    await Promise.all([
      envFile.merge(effects, {
        POOL_IDENTIFIER: input.POOL_IDENTIFIER,
        POOL_URL: input.POOL_URL ?? '',
        MEMPOOL_REGISTRY_URL: input.MEMPOOL_REGISTRY_URL ?? '',
      }),
      store.merge(effects, {
        stratumDisplayAddress: input.poolDisplayUrl,
        secureStratumDisplayAddress: input.securePoolDisplayUrl,
      }),
    ])
  },
)
