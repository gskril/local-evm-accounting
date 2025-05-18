import type { Insertable } from 'kysely'
import { type Chain, createPublicClient, http } from 'viem'

import { type Tables, db } from './db'

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
    transport: http(chain.rpcUrl),
  })
}
