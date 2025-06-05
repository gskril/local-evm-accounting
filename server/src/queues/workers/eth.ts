import type { Job } from 'bullmq'
import type { Insertable } from 'kysely'
import { type Address, formatEther, zeroAddress } from 'viem'

import { getViemClient } from '../../chains'
import { type Tables, db } from '../../db'
import { createQueue, createWorker } from '../bullmq'

type JobData = {
  chainId: number
  owner: {
    id: number
    address: Address | null
  }
}

export const ethQueue = createQueue<JobData>('eth')
createWorker<JobData>(ethQueue, processJob)

async function processJob(job: Job<JobData>) {
  const client = await getViemClient(job.data.chainId)

  // TODO: Handle manual accounts
  if (!job.data.owner.address) {
    return
  }

  const balance = await client.getBalance({
    address: job.data.owner.address,
  })

  const token = await db
    .selectFrom('tokens')
    .select('id')
    .where('address', '=', zeroAddress)
    .where('chain', '=', job.data.chainId)
    .executeTakeFirst()

  if (!token) {
    throw new Error('Token does not exist')
  }

  const data: Insertable<Tables['balances']> = {
    token: token.id,
    owner: job.data.owner.id,
    balance: Number(formatEther(balance)),
    ethValue: Number(formatEther(balance)),
  }

  await db
    .insertInto('balances')
    .values(data)
    .onConflict((oc) =>
      oc
        .columns(['token', 'owner'])
        .doUpdateSet({ ...data, updatedAt: new Date().toISOString() })
    )
    .execute()
}
