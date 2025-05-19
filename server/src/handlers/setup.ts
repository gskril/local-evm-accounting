import type { Context } from 'hono'

import { defaultChains } from '../chains'
import { db } from '../db'
import { defaultTokens } from '../tokens'

export async function setupDefaultChains(c: Context) {
  await db
    .insertInto('chains')
    .values(defaultChains)
    .onConflict((oc) => oc.doNothing())
    .execute()

  return c.json({ success: true })
}

export async function setupDefaultTokens(c: Context) {
  await db
    .insertInto('tokens')
    .values(defaultTokens)
    .onConflict((oc) => oc.doNothing())
    .execute()

  return c.json({ success: true })
}
