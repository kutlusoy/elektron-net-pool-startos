import { sdk } from '../sdk'
import { config } from './config'
import { diagnostics } from './diagnostics'
import { elektronRpc } from './elektron-rpc'
import { hobbyMiners } from './hobby-miners'
import { logRetention } from './log-retention'
import { resetDatabase } from './reset-database'

export const actions = sdk.Actions.of()
  .addAction(config)
  .addAction(elektronRpc)
  .addAction(hobbyMiners)
  .addAction(diagnostics)
  .addAction(logRetention)
  .addAction(resetDatabase)
