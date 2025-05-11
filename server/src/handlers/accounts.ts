import type { Context } from 'hono'
import type { BlankEnv } from 'hono/types'
import { isAddress } from 'viem'
import { z } from 'zod'

import { db } from '../db'

export async function getAccounts(c: Context) {
  const accounts = await db.selectFrom('accounts').selectAll().execute()

  const chains = await db
    .selectFrom('chains')
    .selectAll()
    .where(
      'id',
      'in',
      accounts.flatMap((account) => account.chainIds)
    )
    .execute()

  return c.json(
    accounts.map((account) => ({
      ...account,
      chains: chains.filter((chain) => account.chainIds.includes(chain.id)),
    }))
  )
}

export async function getAccount(c: Context<BlankEnv, '/accounts/:address'>) {
  const address = c.req.param('address')

  if (!isAddress(address)) {
    return c.json({ error: 'Invalid address' }, 400)
  }

  const account = await db
    .selectFrom('accounts')
    .selectAll()
    .where('address', '=', address)
    .executeTakeFirst()

  if (!account) {
    return c.json({ error: 'Account not found' }, 404)
  }

  const balances = await db
    .selectFrom('balances')
    .selectAll()
    .where('owner', '=', address)
    .where('chain', 'in', account.chainIds)
    .execute()

  return c.json({
    ...account,
    balances,
  })
}

const addAccountSchema = z.object({
  address: z.string().refine(isAddress, { message: 'Invalid address' }),
  name: z.string(),
  chainIds: z.array(z.number()),
})

export async function addAccount(c: Context) {
  const body = await c.req.json()
  const safeParse = addAccountSchema.safeParse(body)

  if (!safeParse.success) {
    return c.json({ error: safeParse.error.message }, 400)
  }

  const account = safeParse.data
  await db.insertInto('accounts').values(account).execute()
  return c.json(account)
}
