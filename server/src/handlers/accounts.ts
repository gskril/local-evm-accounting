import type { Context } from 'hono'
import type { BlankEnv } from 'hono/types'
import { type Address, isAddress } from 'viem'
import { z } from 'zod'

import { getViemClient } from '../chains'
import { db } from '../db'
import { truncateAddress } from '../utils'

export async function getAccounts(c: Context) {
  const accounts = await db.selectFrom('accounts').selectAll().execute()
  return c.json(accounts)
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

  // const balances = await db
  //   .selectFrom('balances')
  //   .selectAll()
  //   .where('owner', '=', address)
  //   .where('chain', 'in', account.chainIds)
  //   .execute()

  return c.json(account)
}

const addAccountSchema = z.object({
  addressOrName: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
})

export async function addAccount(c: Context) {
  const body = await c.req.json()
  const safeParse = addAccountSchema.safeParse(body)

  if (!safeParse.success) {
    return c.json({ error: safeParse.error }, 400)
  }

  let { addressOrName, name, description } = safeParse.data

  if (!isAddress(addressOrName)) {
    const client = await getViemClient(1)
    const ensAddress = await client.getEnsAddress({ name: addressOrName })

    if (ensAddress) {
      if (!name) {
        name = addressOrName
      }

      addressOrName = ensAddress
    } else {
      return c.json({ error: 'Invalid address or ENS name' }, 400)
    }
  }

  if (!name) {
    name = truncateAddress(addressOrName as Address)
  }

  const data = {
    address: addressOrName as Address,
    name,
    description,
  }

  await db
    .insertInto('accounts')
    .values(data)
    .onConflict((oc) => oc.column('address').doUpdateSet(data))
    .execute()

  return c.json({ success: true })
}

export async function deleteAccount(c: Context) {
  const address = c.req.param('address')

  if (!isAddress(address)) {
    return c.json({ error: 'Invalid address' }, 400)
  }

  await db.deleteFrom('accounts').where('address', '=', address).execute()
  return c.json({ success: true })
}
