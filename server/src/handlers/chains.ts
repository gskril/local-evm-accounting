import type { Context } from 'hono'
import { createPublicClient, http } from 'viem'
import { z } from 'zod'

import { db } from '../db'

const schema = z.object({
  name: z.string(),
  rpcUrl: z.string(),
})

export async function addChain(c: Context) {
  const safeParse = schema.safeParse(await c.req.json())

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  // Test RPC
  const client = createPublicClient({
    transport: http(safeParse.data.rpcUrl),
  })
  let chainId: number | null = null

  try {
    chainId = await client.getChainId()
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to connect to RPC',
      },
      400
    )
  }

  await db
    .insertInto('chains')
    .values({ ...safeParse.data, id: chainId })
    .onConflict((oc) => oc.columns(['id']).doUpdateSet(safeParse.data))
    .execute()

  return c.json({ success: true })
}

export async function deleteChain(c: Context) {
  const id = c.req.param('id')
  const safeParse = z.coerce.number().safeParse(id)

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  await db.deleteFrom('chains').where('id', '=', safeParse.data).execute()
  return c.json({ success: true })
}

export async function getChains(c: Context) {
  const chains = await db.selectFrom('chains').selectAll().execute()
  return c.json(chains)
}
