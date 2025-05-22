import { Job, Queue, type QueueOptions, Worker } from 'bullmq'

import { redis } from './redis'

const bullMqOptions: QueueOptions = {
  connection: redis,
  prefix: 'evm-portfolio',
}

export function createQueue<T>(name: string) {
  return new Queue<T>(name, bullMqOptions)
}

export function createWorker<T>(
  queue: Queue<T>,
  jobHandler: (job: Job) => Promise<void>,
  opts?: {
    concurrency?: number
  }
) {
  const concurrency = opts?.concurrency || 5

  const worker = new Worker<T>(queue.name, jobHandler, {
    ...bullMqOptions,
    useWorkerThreads: concurrency > 1,
    removeOnComplete: { count: 100 },
    concurrency,
  })

  // TODO: maybe send webhook to client with realtime job updates ?
  // https://docs.bullmq.io/guide/jobs/getters
  // worker.on('completed', async (job) => {
  //   console.log('completed', queue.name, job.id)
  //   const waitingCount = await queue.getJobCounts('waiting', 'active')
  //   console.log('waitingCount', waitingCount)
  // })

  // worker.on('failed', async (job, error) => {
  //   console.log('failed', queue.name, job?.id, error)
  //   const waitingCount = await queue.getJobCounts('waiting')
  //   console.log('waitingCount', waitingCount)
  // })

  return worker
}
