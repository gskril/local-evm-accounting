import { useQuery } from '@tanstack/react-query'
import { hcWithType } from 'server'

import { Hex } from '@/lib/types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export const honoClient = hcWithType(SERVER_URL)

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => honoClient.accounts.$get(),
  })
}

export function useAccount(address: Hex | undefined) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => honoClient.accounts.$get({ query: { address } }),
  })
}
