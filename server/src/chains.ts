import type { Insertable } from 'kysely'

import type { Tables } from './db'

export const defaultChains: Insertable<Tables['chains']>[] = [
  {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://base.drpc.org',
  },
]
