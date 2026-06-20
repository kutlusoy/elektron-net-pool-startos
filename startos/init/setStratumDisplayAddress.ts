import { store } from '../file-models/store.json'
import { sdk } from '../sdk'

// Seed only missing values so user selections survive updates and restores
export const setStratumDisplayAddress = sdk.setupOnInit(async (effects) => {
  const current = await store.read().once()
  if (current?.stratumDisplayAddress && current?.secureStratumDisplayAddress)
    return

  const [stratumDisplayAddress, secureStratumDisplayAddress] =
    await sdk.serviceInterface
      .getOwn(effects, 'stratum', (iface) => {
        const addrs = iface?.addressInfo?.nonLocal
        const pick = (ssl: boolean) =>
          addrs
            ?.filter({ kind: 'mdns', predicate: (h) => h.ssl === ssl })
            ?.format()[0] ||
          addrs
            ?.filter({
              visibility: 'private',
              kind: 'ipv4',
              predicate: (h) => h.ssl === ssl,
            })
            ?.format()[0]
        return [pick(false), pick(true)]
      })
      .const()

  await store.merge(effects, {
    ...(current?.stratumDisplayAddress ? {} : { stratumDisplayAddress }),
    ...(current?.secureStratumDisplayAddress
      ? {}
      : { secureStratumDisplayAddress }),
  })
})
