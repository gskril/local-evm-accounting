import type { Context } from 'hono'
import type { BlankEnv } from 'hono/types'
import { type Address, isAddress } from 'viem'
import { z } from 'zod'

import { getViemClient } from '../chains'
import { db } from '../db'
import { truncateAddress } from '../utils'

const getAccountsSchema = z.object({
  type: z.enum(['onchain', 'offchain']).optional(),
})

export async function getAccounts(c: Context) {
  const safeParse = getAccountsSchema.safeParse(c.req.query())

  if (!safeParse.success) {
    throw new Error('Invalid query parameters')
  }

  const { type } = safeParse.data

  let accounts

  switch (type) {
    case 'onchain':
      accounts = await db
        .selectFrom('accounts')
        .selectAll()
        .where('address', 'is not', null)
        .execute()
      break
    case 'offchain':
      accounts = await db
        .selectFrom('accounts')
        .selectAll()
        .where('address', 'is', null)
        .execute()
      break
    default:
      accounts = await db.selectFrom('accounts').selectAll().execute()
  }

  return c.json(accounts)
}

// Maybe will be relevant in the future but we don't need it right now
// export async function getAccount(c: Context<BlankEnv, '/accounts/:address'>) {
//   const address = c.req.param('address')

//   if (!isAddress(address)) {
//     return c.json({ error: 'Invalid address' }, 400)
//   }

//   const account = await db
//     .selectFrom('accounts')
//     .selectAll()
//     .where('address', '=', address)
//     .executeTakeFirst()

//   if (!account) {
//     return c.json({ error: 'Account not found' }, 404)
//   }

//   return c.json(account)
// }

const addAccountSchema = z.object({
  id: z.coerce.number().optional(),
  addressOrName: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
})

export async function addAccount(c: Context) {
  const body = await c.req.json()
  const safeParse = addAccountSchema.safeParse(body)

  if (!safeParse.success) {
    return c.json({ error: safeParse.error }, 400)
  }

  let { id, addressOrName, name, description } = safeParse.data

  if (!addressOrName && !name) {
    return c.json(
      { error: 'At least one of `addressOrName` or `name` is required' },
      400
    )
  }

  // Handle offchain accounts
  if (!addressOrName) {
    if (id) {
      // Update an existing offchain account
      await db
        .updateTable('accounts')
        .set({
          name,
          description,
        })
        .where('id', '=', id)
        .execute()
    } else {
      // Create a new offchain account
      await db
        .insertInto('accounts')
        .values({
          name: name!,
          description,
        })
        .execute()
    }

    return c.json({ success: true })
  }

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

  if (!isAddress(addressOrName)) {
    // This should be unreachable and is mainly a formality for TypeScript
    return c.json({ error: 'Error resolving ENS name' }, 400)
  }

  const data = {
    address: addressOrName,
    name: name ?? truncateAddress(addressOrName),
    description,
  }

  // If the address is not null, we should prevent duplicates. But technically
  // the address can't be marked as unique in the db schema because it's
  // possible to have a null address.
  const existingAddress = await db
    .selectFrom('accounts')
    .select('id')
    .where('address', '=', addressOrName)
    .executeTakeFirst()

  if (existingAddress) {
    return c.json({ error: 'Account already exists' }, 400)
  }

  await db.insertInto('accounts').values(data).execute()

  return c.json({ success: true })
}

export async function deleteAccount(c: Context) {
  const id = c.req.param('id')
  const safeParse = z.coerce.number().safeParse(id)

  if (!safeParse.success) {
    return c.json({ error: 'Invalid account ID' }, 400)
  }

  await db.deleteFrom('accounts').where('id', '=', safeParse.data).execute()
  return c.json({ success: true })
}
