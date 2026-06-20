import { LangDict } from './default'

export default {
  de_DE: {
    // main.ts
    1: 'Stratum-Server ist bereit',
    2: 'Stratum-Server ist nicht bereit',
    3: 'Die Weboberfläche ist bereit',
    4: 'Die Weboberfläche ist nicht bereit',
    5: 'Weboberfläche',

    // interfaces.ts
    100: 'Weboberfläche',
    101: 'Persönliche Weboberfläche für Elektron Net Pool',
    102: 'Stratum-Server',
    103: 'Ihr Stratum-Server',

    // actions/config.ts
    200: 'Pool-Identifikator',
    201: 'Der Pool-Identifikator, der in den Coinbase-Transaktionen enthalten sein soll',
    202: 'Server-Anzeige-URL',
    203: 'Die IP-Adresse oder der Hostname, der auf der Elektron-Net-Pool-Homepage angezeigt werden soll',
    204: 'Konfigurieren',
    205: 'Passen Sie Ihre Elektron-Net-Pool-Instanz an',

    // actions/elektron-rpc.ts
    300: 'Elektron-Knoten-RPC',
    301: 'Verbinden Sie Elektron Net Pool mit Ihrem Elektron-Net-Full-Node',
  },
} satisfies Record<string, LangDict>
