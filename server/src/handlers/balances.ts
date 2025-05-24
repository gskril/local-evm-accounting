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
  const { balances, tokens, chains } = await db
    .transaction()
    .execute(async (trx) => {
      // Get all balances, grouped by token (address + chain)
      const balances = (await trx
        .selectFrom('balances')
        .select([
          'token',
          trx.fn.sum('balance').as('balance'),
          trx.fn.sum('ethValue').as('ethValue'),
        ])
        .where('balance', '>', 0)
        .groupBy(['token'])
        .orderBy('ethValue', 'desc')
        .execute()) as {
        // For some reason kysely infers `balance` and `ethValue` incorrectly
        token: number
        balance: number
        ethValue: number
      }[]

      const tokens = await trx
        .selectFrom('tokens')
        .selectAll()
        .where(
          'id',
          'in',
          balances.map((b) => b.token)
        )
        .execute()

      const chains = await trx.selectFrom('chains').selectAll().execute()

      return { balances, tokens, chains }
    })

  const tokensWithChain = tokens.map((t) => ({
    ...t,
    chain: chains.find((c) => c.id === t.chain)!,
  }))

  const enhancedBalances = balances.map((b) => ({
    balance: b.balance,
    ethValue: b.ethValue,
    ethValuePerToken: b.ethValue / b.balance,
    ...tokensWithChain.find((t) => t.id === b.token)!,
  }))

  // Note: this isn't technically precise because different tokens could have
  // the same address on different chains, but i've never seen that happen in
  // practice, so I'd rather optimize for UX by combining stuff like (W)ETH
  // across chains. Worst case, the totalEthValue will still be accurate
  // (I think) just with a slightly different breakdown.
  // const combinedBalances = enhancedBalances.reduce(
  //   (acc, balance) => {
  //     const existing = acc.find((b) => b.address === balance.address)
  //     if (existing) {
  //       existing.balance += balance.balance
  //       existing.ethValue += balance.ethValue
  //     } else {
  //       acc.push({ ...balance })
  //     }
  //     return acc
  //   },
  //   [] as typeof enhancedBalances
  // )

  const totalEthValue = enhancedBalances.reduce((acc, b) => acc + b.ethValue, 0)
  return c.json({ totalEthValue, tokens: enhancedBalances })
}

export async function getEthValueByAccount(c: Context) {
  const { balances, accounts } = await db.transaction().execute(async (trx) => {
    const balances = await trx
      .selectFrom('balances')
      .select(['owner', db.fn.sum('ethValue').as('ethValue')])
      .where('ethValue', '>', 0)
      .groupBy(['owner'])
      .orderBy('ethValue', 'desc')
      .execute()

    const accounts = await trx
      .selectFrom('accounts')
      .select(['address', 'name'])
      .where(
        'address',
        'in',
        balances.map((b) => b.owner)
      )
      .execute()

    return { balances, accounts }
  })

  const data = balances.map((b) => ({
    ethValue: Number(b.ethValue),
    owner: accounts.find((a) => a.address === b.owner)!,
  }))

  return c.json(data)
}
