import type { Context } from 'hono'
import { isAddress } from 'viem'
import { z } from 'zod'

import { db } from '../db'

const schema = z.object({
  address: z.string().refine(isAddress),
  chain: z.number(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})

export async function addToken(c: Context) {
  const safeParse = schema.safeParse(await c.req.json())

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  await db.insertInto('tokens').values(safeParse.data).execute()

  return c.json({ success: true })
}

export async function getTokens(c: Context) {
  const { tokens, chains } = await db.transaction().execute(async (trx) => {
    const tokens = await trx.selectFrom('tokens').selectAll().execute()
    const chains = await trx.selectFrom('chains').selectAll().execute()

    return { tokens, chains }
  })

  return c.json(
    tokens.map((token) => ({
      ...token,
      chain: chains.find((chain) => chain.id === token.chain),
    }))
  )
}
