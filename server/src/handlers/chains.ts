import type { Context } from 'hono'
import { z } from 'zod'

import { db } from '../db'

const schema = z.object({
  id: z.number(),
  name: z.string(),
  rpcUrl: z.string(),
})

export async function addChain(c: Context) {
  const safeParse = schema.safeParse(await c.req.json())

  if (!safeParse.success) {
    return c.json(safeParse.error, 400)
  }

  await db.insertInto('chains').values(safeParse.data).execute()

  return c.json({ success: true })
}
