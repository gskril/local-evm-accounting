import type { Context } from 'hono'
import { zeroAddress } from 'viem'

import { db } from '../db'
import { erc20Queue } from '../queues/workers/erc20'
import { ethQueue } from '../queues/workers/eth'

export async function fetchBalances(c: Context) {
  const accounts = await db.selectFrom('accounts').selectAll().execute()
  const tokens = await db.selectFrom('tokens').selectAll().execute()

  for (const account of accounts) {
    for (const token of tokens) {
      if (token.address === zeroAddress) {
        // Native ETH
        await ethQueue.add(`${account.address}-${token.chain}`, {
          address: account.address,
          chainId: token.chain,
        })
      } else {
        // ERC20s
        await erc20Queue.add(`${account.address}-${token.chain}`, {
          token: token.address,
          owner: account.address,
          chainId: token.chain,
        })
      }
    }
  }

  return c.json({ success: true })
}

export async function getBalances(c: Context) {
  const { balances, tokens } = await db.transaction().execute(async (trx) => {
    // Get all balances and aggregate by token (address + chain)
    const balances = await trx
      .selectFrom('balances')
      .select(['token', 'chain', trx.fn.sum('balance').as('balance')])
      .where('balance', '>', 0)
      .groupBy(['token', 'chain'])
      .execute()

    const tokens = await trx
      .selectFrom('tokens')
      .selectAll()
      .where(
        'id',
        'in',
        balances.map((b) => b.token)
      )
      .execute()

    return { balances, tokens }
  })

  return c.json(
    balances.map((b) => ({
      ...b,
      token: tokens.find((t) => t.id === b.token),
    }))
  )
}
