import type { Context } from 'hono'
import { erc20Abi, isAddress, zeroAddress } from 'viem'
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

  // Treat ETH as a special case
  if (safeParse.data.address === zeroAddress) {
    await db
      .insertInto('tokens')
      .values({
        address: safeParse.data.address,
        chain: safeParse.data.chainId,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      })
      .onConflict((oc) => oc.doNothing())
      .execute()
  } else {
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
      .onConflict((oc) => oc.doNothing())
      .execute()
  }

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

const deleteTokenSchema = z.object({
  address: z.string().refine(isAddress),
  chainId: z.coerce.number(),
})

export async function deleteToken(c: Context) {
  const safeParse = deleteTokenSchema.safeParse(await c.req.json())

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  await db
    .deleteFrom('tokens')
    .where('address', '=', safeParse.data.address)
    .where('chain', '=', safeParse.data.chainId)
    .execute()

  return c.json({ success: true })
}
