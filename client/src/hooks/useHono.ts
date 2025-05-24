import { useQuery } from '@tanstack/react-query'
import { hcWithType } from 'server/hc'

import { Hex } from '../lib/types'
import { useQueues } from './useQueues'

export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

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
  const { data: queues } = useQueues()

  return useQuery({
    // Only refetch when the queue is active
    queryKey: ['balances', queues?.inProgress ?? 0],
    queryFn: async () => {
      const res = await honoClient.balances.$get()
      const json = await res.json()

      const ethValueByChain = json.tokens.reduce(
        (acc, token) => {
          const chainId = token.chain.id
          const chainName = token.chain.name

          const existing = acc.find((item) => item.id === chainId)
          if (existing) {
            existing.totalEthValue += token.ethValue
          } else {
            acc.push({
              id: chainId,
              name: chainName,
              totalEthValue: token.ethValue,
            })
          }
          return acc
        },
        [] as { id: number; name: string; totalEthValue: number }[]
      )

      return { ...json, ethValueByChain }
    },
  })
}

export function useFiat() {
  const { data: chains } = useChains()
  const mainnetIsConfigured = chains?.some((chain) => chain.id === 1)

  return useQuery({
    queryKey: ['fiat', mainnetIsConfigured],
    queryFn: async () => {
      const res = await honoClient.fiat.$get()
      const array = await res.json()

      function getRate(key: string | undefined) {
        // Fallback to 1 means falling back to ETH
        return array.find((item) => item.label === key)?.rateToEth ?? 1
      }

      return { array, getRate }
    },
  })
}

export function useEthValuesByAccount() {
  return useQuery({
    queryKey: ['ethValuesByAccount'],
    queryFn: async () => {
      const res = await honoClient.balances.accounts.$get()
      return res.json()
    },
  })
}
