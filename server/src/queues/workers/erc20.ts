import type { Job } from 'bullmq'
import type { Insertable } from 'kysely'
import { type Address, erc20Abi, erc4626Abi, formatUnits } from 'viem'

import { getViemClient } from '../../chains'
import { type Tables, db } from '../../db'
import { getRateToEth } from '../../price'
import { createQueue, createWorker } from '../bullmq'

type JobData = {
  chainId: number
  token: Address
  owner: {
    id: number
    address: Address | null
  }
}

export const erc20Queue = createQueue<JobData>('erc20')
createWorker<JobData>(erc20Queue, processJob)

// TODO: Refactor this code such that offchain accounts can support ERC-4626. Currently it only supports onchain accounts.
async function processJob(job: Job<JobData>) {
  const client = await getViemClient(job.data.chainId)

  const token = await db
    .selectFrom('tokens')
    .select(['id', 'decimals', 'erc4626AssetAddress', 'erc4626AssetDecimals'])
    .where('address', '=', job.data.token)
    .where('chain', '=', job.data.chainId)
    .executeTakeFirst()

  if (!token) {
    throw new Error(`Token ${job.data.token} not found`)
  }

  // Formatted balance, not the full bigint
  let balance: number

  // Handle ERC4626
  const isErc4626 = !!token.erc4626AssetAddress
  const effectiveAddress = token.erc4626AssetAddress ?? job.data.token
  const effectiveDecimals = token.erc4626AssetDecimals ?? token.decimals

  if (job.data.owner.address) {
    // Handle onchain account
    const rawBalance = await client.readContract({
      abi: erc20Abi,
      address: job.data.token,
      functionName: 'balanceOf',
      args: [job.data.owner.address],
    })

    if (isErc4626) {
      // Handle ERC-4626 which provides a standard way to get the underlying asset of a yield-bearing token
      const underlyingAssetBalance = await client.readContract({
        abi: erc4626Abi,
        address: job.data.token,
        functionName: 'convertToAssets',
        args: [rawBalance],
      })
      balance = Number(formatUnits(underlyingAssetBalance, effectiveDecimals))
    } else {
      balance = Number(formatUnits(rawBalance, effectiveDecimals))
    }

    const rateToEth = await getRateToEth({
      address: effectiveAddress,
      chainId: job.data.chainId,
      decimals: effectiveDecimals,
    })

    const data: Insertable<Tables['balances']> = {
      token: token.id,
      owner: job.data.owner.id,
      balance,
      ethValue: balance * rateToEth,
    }

    await db
      .insertInto('balances')
      .values(data)
      .onConflict((oc) =>
        oc
          .columns(['token', 'owner'])
          .doUpdateSet({ ...data, updatedAt: new Date().toISOString() })
      )
      .execute()
  } else {
    // Handle manual account (without an address)
    const balanceFromDb = await db
      .selectFrom('balances')
      .select('balance')
      .where('token', '=', token.id)
      .where('owner', '=', job.data.owner.id)
      .executeTakeFirst()

    if (!balanceFromDb) {
      throw new Error(`Balance for token ${job.data.token} not found`)
    }

    balance = balanceFromDb.balance

    const rateToEth = await getRateToEth({
      address: job.data.token,
      chainId: job.data.chainId,
      decimals: token.decimals,
    })

    const data: Insertable<Tables['balances']> = {
      token: token.id,
      owner: job.data.owner.id,
      balance,
      ethValue: balance * rateToEth,
    }

    await db
      .insertInto('balances')
      .values(data)
      .onConflict((oc) =>
        oc
          .columns(['token', 'owner'])
          .doUpdateSet({ ...data, updatedAt: new Date().toISOString() })
      )
      .execute()
  }
}
