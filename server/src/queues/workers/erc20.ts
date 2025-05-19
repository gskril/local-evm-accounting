import type { Job } from 'bullmq'
import type { Insertable } from 'kysely'
import { type Address, erc20Abi, formatUnits } from 'viem'

import { getViemClient } from '../../chains'
import { type Tables, db } from '../../db'
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
    .select(['id', 'decimals'])
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
    token: token.id,
    owner: job.data.owner,
    balance: Number(formatUnits(balance, token.decimals)),
    ethValue: 0,
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
