import { getStore, resetStore } from './store'
import { createSeedData } from './seed'

export function ensureSeed() {
  const store = getStore()
  if (store.programs.length === 0) {
    resetStore(createSeedData())
  }
}
