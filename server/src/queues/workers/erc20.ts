import type { Job } from 'bullmq'
import type { Insertable } from 'kysely'
import { type Tables, db } from 'server/src/db'
import { type Address, erc20Abi, formatUnits } from 'viem'

import { getViemClient } from '../../chains'
import { createQueue, createWorker } from '../bullmq'

type JobData = {
  chainId: number
  token: Address
  owner: Address
}

export const erc20Queue = createQueue<JobData>('erc20')
createWorker<JobData>('erc20', processJob)

async function processJob(job: Job<JobData>) {
  const client = await getViemClient(job.data.chainId)

  const token = await db
    .selectFrom('tokens')
    .select(['decimals'])
    .where('address', '=', job.data.token)
    .where('chain', '=', job.data.chainId)
    .executeTakeFirst()

  if (!token) {
    throw new Error(`Token ${job.data.token} not found`)
  }

  const balance = await client.readContract({
    abi: erc20Abi,
    address: job.data.token,
    functionName: 'balanceOf',
    args: [job.data.owner],
  })

  const data: Insertable<Tables['balances']> = {
    token: job.data.token,
    owner: job.data.owner,
    chain: job.data.chainId,
    balance: Number(formatUnits(balance, token.decimals)),
    usdValue: 0,
  }

  await db
    .insertInto('balances')
    .values(data)
    .onConflict((oc) =>
      oc
        .columns(['token', 'chain', 'owner'])
        .doUpdateSet({ ...data, updatedAt: new Date().toISOString() })
    )
    .execute()
}
