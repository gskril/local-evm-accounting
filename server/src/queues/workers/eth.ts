import type { Job } from 'bullmq'
import type { Insertable } from 'kysely'
import { type Tables, db } from 'server/src/db'
import { type Address, formatEther } from 'viem'

import { getViemClient } from '../../chains'
import { createQueue, createWorker } from '../bullmq'

type JobData = {
  chainId: number
  address: Address
}

export const ethQueue = createQueue<JobData>('eth')
createWorker<JobData>('eth', processJob)

async function processJob(job: Job<JobData>) {
  const client = await getViemClient(job.data.chainId)
  const balance = await client.getBalance({
    address: job.data.address,
  })

  const data: Insertable<Tables['balances']> = {
    token: '0x0000000000000000000000000000000000000000',
    owner: job.data.address,
    chain: job.data.chainId,
    balance: Number(formatEther(balance)),
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
