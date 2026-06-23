import { sdk } from '../sdk'
import { config } from './config'
import { diagnostics } from './diagnostics'
import { elektronRpc } from './elektron-rpc'
import { resetDatabase } from './reset-database'

export const actions = sdk.Actions.of()
  .addAction(config)
  .addAction(elektronRpc)
  .addAction(diagnostics)
  .addAction(resetDatabase)
