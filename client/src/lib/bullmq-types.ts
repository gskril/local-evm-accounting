// The types from @bull-board/api are not exported so we need to copy them here
// https://github.com/felixmosh/bull-board/tree/master/packages/api

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STATUSES = {
  latest: 'latest',
  active: 'active',
  waiting: 'waiting',
  waitingChildren: 'waiting-children',
  prioritized: 'prioritized',
  completed: 'completed',
  failed: 'failed',
  delayed: 'delayed',
  paused: 'paused',
} as const

type Values<T> = T[keyof T]

type BullMQStatuses = Values<typeof STATUSES>

type BullStatuses = Exclude<BullMQStatuses, 'prioritized' | 'waiting-children'>

type Library = 'bull' | 'bullmq'

type Status<Lib extends Library = 'bullmq'> = Lib extends 'bullmq'
  ? BullMQStatuses
  : Lib extends 'bull'
    ? BullStatuses
    : never

interface QueueJobJson {
  // add properties as needed from real Bull/BullMQ jobs
  id?: string | undefined | number | null
  name: string
  progress: string | boolean | number | object
  attemptsMade: number
  finishedOn?: number | null
  processedOn?: number | null
  processedBy?: string | null
  delay?: number
  timestamp: number
  failedReason: string
  stacktrace: string[] | null
  data: unknown
  returnvalue: unknown
  opts: unknown
  parentKey?: string
}

interface AppJob {
  id: QueueJobJson['id']
  name: QueueJobJson['name']
  timestamp: QueueJobJson['timestamp']
  processedOn?: QueueJobJson['processedOn']
  processedBy?: QueueJobJson['processedBy']
  finishedOn?: QueueJobJson['finishedOn']
  progress: QueueJobJson['progress']
  attempts: QueueJobJson['attemptsMade']
  failedReason: QueueJobJson['failedReason']
  stacktrace: string[]
  delay: number | undefined
  opts: QueueJobJson['opts']
  data: QueueJobJson['data']
  returnValue: QueueJobJson['returnvalue']
  isFailed: boolean
  externalUrl?: {
    displayText?: string
    href: string
  }
}

interface Pagination {
  pageCount: number
  range: {
    start: number
    end: number
  }
}

type QueueType = Library

interface AppQueue {
  delimiter: string
  name: string
  displayName?: string
  description?: string
  counts: Record<Status, number>
  jobs: AppJob[]
  statuses: Status[]
  pagination: Pagination
  readOnlyMode: boolean
  allowRetries: boolean
  allowCompletedRetries: boolean
  isPaused: boolean
  type: QueueType
}

export interface GetQueuesResponse {
  queues: AppQueue[]
}
