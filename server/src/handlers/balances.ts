import type { Context } from 'hono'

import { ethQueue } from '../queues/workers/eth'
import { getAccounts, getFilteredAccounts } from './accounts'

export async function fetchBalances(c: Context) {
  const accounts = await getFilteredAccounts()
  for (const account of accounts) {
    await ethQueue.add(`${account.address}-${account.chainIds[0]}`, {
      address: account.address,
      chainId: account.chainIds[0]!,
    })
  }

  return c.json({ success: true })
}
