import type { Insertable } from 'kysely'

import type { Tables } from './db'

export const defaultTokens: Insertable<Tables['tokens']>[] = []
