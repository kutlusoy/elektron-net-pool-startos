import { setupManifest } from '@start9labs/start-sdk'
import { elektrondDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'elektron-net-pool',
  title: 'Elektron Net Pool',
  packageRepo: 'https://github.com/kutlusoy/elektron-net-pool-startos',
  upstreamRepo: 'https://github.com/kutlusoy/elektron-net-pool',
  marketingUrl: 'https://elektron-net.org',
  donationUrl: 'https://elektron-net.org',
  description: { short, long },
  volumes: ['main'],
  images: {
    'elektron-net-pool': {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    elektrond: {
      description: elektrondDescription,
      // Optional: the pool can also connect to a remote Elektron Net node
      // via the `elektron-rpc` action. When elektrond is installed on the
      // same StartOS host the dependency relationship is shown in the UI.
      optional: true,
      metadata: {
        title: 'Elektron Net',
        icon: 'https://raw.githubusercontent.com/kutlusoy/elektron-net-startos/main/icon.svg',
      },
    },
  },
})
