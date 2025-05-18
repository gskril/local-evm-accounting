import { createQueue, createWorker } from '../bullmq'

export const ethQueue = createQueue<{ address: string }>('eth')

const ethWorker = createWorker('eth', async (job) => {
  console.log('eth worker', job)
})
