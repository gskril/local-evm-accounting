import type { Insertable } from 'kysely'
import { type Chain, createPublicClient, http } from 'viem'

import type { Tables } from './db'

export const defaultChains: Insertable<Tables['chains']>[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
  },
  {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://base-rpc.publicnode.com',
  },
]

export async function getViemClient(chainId: number) {
  const chain = defaultChains.find((c) => c.id === chainId)

  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  return createPublicClient({
    chain: chain as unknown as Chain,
    transport: http(),
  })
}
