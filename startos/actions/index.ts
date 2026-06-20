import { sdk } from '../sdk'
import { config } from './config'
import { elektronRpc } from './elektron-rpc'

export const actions = sdk.Actions.of().addAction(config).addAction(elektronRpc)
