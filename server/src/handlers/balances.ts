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
