import { sdk } from '../sdk'
import { envFile } from '../file-models/env'
import { utils } from '@start9labs/start-sdk'
import { store } from '../file-models/store.json'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  POOL_IDENTIFIER: Value.text({
    name: 'Pool Identifier',
    description: 'The pool identifier to include in the Coinbase transactions',
    required: true,
    default: 'Elektron-Pool on StartOS',
    placeholder: 'Elektron-Pool on StartOS',
    maxLength: 100,
    patterns: [utils.Patterns.ascii],
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

  async ({ effects }) => ({
    POOL_IDENTIFIER: (await envFile.read().once())?.POOL_IDENTIFIER,
    poolDisplayUrl:
      (await store.read((s) => s.stratumDisplayAddress).once()) || undefined,
    securePoolDisplayUrl:
      (await store.read((s) => s.secureStratumDisplayAddress).once()) ||
      undefined,
  }),

  async ({ effects, input }) => {
    await Promise.all([
      envFile.merge(effects, {
        POOL_IDENTIFIER: input.POOL_IDENTIFIER,
      }),
      store.merge(effects, {
        stratumDisplayAddress: input.poolDisplayUrl,
        secureStratumDisplayAddress: input.securePoolDisplayUrl,
      }),
    ])
  },
)
