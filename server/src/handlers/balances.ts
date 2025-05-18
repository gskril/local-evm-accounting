import type { Context } from 'hono'

import { ethQueue } from '../queues/workers/eth'
import { getFilteredAccounts } from './accounts'

export async function fetchBalances(c: Context) {
  const accounts = await getFilteredAccounts()
  for (const account of accounts) {
    for (const chain of account.chains) {
      await ethQueue.add(`${account.address}-${chain.id}`, {
        address: account.address,
        chainId: chain.id,
      })
    }
  }

  return c.json({ success: true })
}
