import { useQuery } from '@tanstack/react-query'

import { GetQueuesResponse } from '../lib/bullmq-types'
import { SERVER_URL } from './useHono'

export function useQueues() {
  return useQuery({
    queryKey: ['queues'],
    refetchInterval: 1000,
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/dashboard/api/queues`)
      const data = (await res.json()) as GetQueuesResponse

      const [completed, waiting, active] = [
        'completed',
        'waiting',
        'active',
      ].map((status) =>
        data.queues.reduce(
          (acc, queue) =>
            acc + queue.counts[status as keyof typeof queue.counts],
          0
        )
      )

      return {
        completed,
        inProgress: active + waiting,
      }
    },
  })
}
