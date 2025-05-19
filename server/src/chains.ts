import type { Insertable } from 'kysely'
import { type Chain, createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

import { type Tables, db } from './db'

// Can only get the value of tokens if CheckTheChain or 1inch Spot Price Aggregator is available on the chain
// https://github.com/NaniDAO/ctc Ethereum, Optimism, Base, Arbitrum and Polygon.
// https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction
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
  {
    id: 10,
    name: 'OP Mainnet',
    rpcUrl: 'https://optimism-rpc.publicnode.com',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arbitrum-one-rpc.publicnode.com',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
  },
]

// TODO: Optimize this so we don't read from Postgres every call
export async function getViemClient(chainId: number) {
  const chain = await db
    .selectFrom('chains')
    .select(['rpcUrl'])
    .where('id', '=', chainId)
    .executeTakeFirst()

  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  return createPublicClient({
    // Viem doesn't technically need the chain info, but we'll provide it for mainnet to make ENS resolution easier
    chain: chainId === 1 ? mainnet : undefined,
    transport: http(chain.rpcUrl),
  })
}
