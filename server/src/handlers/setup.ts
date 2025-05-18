import type { Context } from 'hono'

import { defaultChains } from '../chains'
import { db } from '../db'
import { defaultTokens } from '../tokens'

export async function setupDefaultChainsAndTokens(c: Context) {
  await db
    .insertInto('chains')
    .values(defaultChains)
    .onConflict((oc) => oc.doNothing())
    .execute()

  await db
    .insertInto('tokens')
    .values(defaultTokens)
    .onConflict((oc) => oc.doNothing())
    .execute()

  return c.json({ success: true })
}
