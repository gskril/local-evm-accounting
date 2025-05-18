import type { Job } from 'bullmq'
import type { Address } from 'viem'

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
  console.log(balance)
}
