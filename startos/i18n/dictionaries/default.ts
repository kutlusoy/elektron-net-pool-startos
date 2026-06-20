export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Stratum server is ready': 1,
  'Stratum server is not ready': 2,
  'The web interface is ready': 3,
  'The web interface is not ready': 4,
  'Web Interface': 5,

  // interfaces.ts
  'Web UI': 100,
  'Personal web user interface for Elektron Net Pool': 101,
  'Stratum Server': 102,
  'Your Stratum server': 103,

  // actions/config.ts
  'Pool Identifier': 200,
  'The pool identifier to include in the Coinbase transactions': 201,
  'Server Display URL': 202,
  'The IP address or hostname to show on your Elektron Net Pool homepage': 203,
  Configure: 204,
  'Customize your Elektron Net Pool instance': 205,

  // actions/elektron-rpc.ts
  'Elektron Node RPC': 300,
  'Connect Elektron Net Pool to your Elektron Net full node': 301,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
