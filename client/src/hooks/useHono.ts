import { useQuery } from '@tanstack/react-query'
import { hcWithType } from 'server/hc'

import { Hex } from '@/lib/types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export const honoClient = hcWithType(SERVER_URL)

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await honoClient.accounts.$get({})
      return res.json()
    },
  })
}

export function useAccount(address: Hex | undefined) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: async () => {
      const res = await honoClient.accounts.$get({ query: { address } })
      return res.json()
    },
  })
}

export function useChains() {
  return useQuery({
    queryKey: ['chains'],
    queryFn: async () => {
      const res = await honoClient.chains.$get()
      return res.json()
    },
  })
}

export function useTokens() {
  return useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const res = await honoClient.tokens.$get()
      return res.json()
    },
  })
}

export function useBalances() {
  return useQuery({
    queryKey: ['balances'],
    refetchInterval: 1000,
    queryFn: async () => {
      const res = await honoClient.balances.$get()
      const json = await res.json()
      // TODO: figure out why honoClient isn't inferring the type
      return json as unknown as {
        token:
          | {
              symbol: string
              id: number
              address: `0x${string}`
              chain: number
              name: string
              decimals: number
            }
          | undefined
        balance: string | number | bigint
      }[]
    },
  })
}
