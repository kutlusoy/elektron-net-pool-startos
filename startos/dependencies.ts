import { sdk } from './sdk'

// No StartOS-native Elektron Net package exists yet. The Elektron Net node
// the pool connects to is configured manually via the Configure action.
export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  return {}
})
