import type { Context } from 'hono'
import { erc20Abi, isAddress } from 'viem'
import { z } from 'zod'

import { getViemClient } from '../chains'
import { db } from '../db'

const schema = z.object({
  address: z.string().refine(isAddress),
  chainId: z.coerce.number(),
})

export async function addToken(c: Context) {
  const safeParse = schema.safeParse(await c.req.json())

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  const client = await getViemClient(safeParse.data.chainId)

  if (!client) {
    throw new Error(`Chain ${safeParse.data.chainId} not found`)
  }

  const contract = {
    address: safeParse.data.address,
    abi: erc20Abi,
  }

  const [name, symbol, decimals] = await client.multicall({
    contracts: [
      { ...contract, functionName: 'name' },
      { ...contract, functionName: 'symbol' },
      { ...contract, functionName: 'decimals' },
    ],
  })

  await db
    .insertInto('tokens')
    .values({
      address: safeParse.data.address,
      chain: safeParse.data.chainId,
      name: name.result ?? '',
      symbol: symbol.result ?? '',
      decimals: decimals.result ?? 0,
    })
    .execute()

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
