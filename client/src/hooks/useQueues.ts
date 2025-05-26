import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { GetQueuesResponse } from '../lib/bullmq-types'
import { SERVER_URL } from './useHono'

export function useQueues() {
  const [isInProgress, setIsInProgress] = useState(false)

  return useQuery({
    queryKey: ['queues'],
    refetchInterval: isInProgress ? 1000 : false,
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/dashboard/api/queues`)
      const data = (await res.json()) as GetQueuesResponse

      const [completed, waiting, active, failed] = [
        'completed',
        'waiting',
        'active',
        'failed',
      ].map((status) =>
        data.queues.reduce(
          (acc, queue) =>
            acc + queue.counts[status as keyof typeof queue.counts],
          0
        )
      )

      setIsInProgress(active + waiting > 0)

      return {
        completed,
        failed,
        inProgress: active + waiting,
      }
    },
  })
}
