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
  const chains = await db.selectFrom('chains').select('id').execute()

  const tokensOnChains = defaultTokens.filter((t) =>
    chains.some((c) => c.id === t.chainId)
  )

  await db
    .insertInto('tokens')
    .values(
      tokensOnChains.map((t) => ({
        ...t,
        chain: t.chainId,
      }))
    )
    .onConflict((oc) => oc.doNothing())
    .execute()

  return c.json({ success: true })
}
