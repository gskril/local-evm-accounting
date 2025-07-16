import { type Address, formatEther, parseAbi } from 'viem'
import { z } from 'zod'

import { getViemClient } from './chains'
import { estimateBlockNumber } from './utils'

// https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction
const SPOT_PRICE_AGGREGATOR = {
  address: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
  abi: parseAbi([
    'function getRateToEth(address srcToken, bool useSrcWrappers) external view returns (uint256 weightedRate)',
  ]),
} as const

type Props = {
  address: Address
  blockNumber?: bigint
  chainId: number
  decimals: number
}

export async function getRateToEth({
  address,
  blockNumber,
  chainId,
  decimals,
}: Props) {
  const client = await getViemClient(chainId)

  const rate = await client.readContract({
    ...SPOT_PRICE_AGGREGATOR,
    functionName: 'getRateToEth',
    args: [address, true],
    blockNumber,
  })

  const numerator = BigInt(10 ** decimals)
  const denominator = BigInt(10 ** 18) // 18 for ETH decimals
  const priceInEth = (rate * numerator) / denominator

  return Number(formatEther(priceInEth))
}

export const supportedCurrencies = ['USD', 'EUR', 'ETH'] as const
export const supportedCurrencySchema = z.enum(supportedCurrencies)
export type SupportedCurrency = z.infer<typeof supportedCurrencySchema>

export async function getFiatRateToEth(
  currency: SupportedCurrency,
  timestamp: string
) {
  // Assume the timestamp is UTC, local server may be different
  const date = new Date(timestamp + 'Z')
  const blockNumber = estimateBlockNumber(date)

  switch (currency) {
    case 'USD':
      return getRateToEth({
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        chainId: 1,
        blockNumber,
      })
    case 'EUR':
      return getRateToEth({
        address: '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c',
        decimals: 6,
        chainId: 1,
        blockNumber,
      })
    case 'ETH':
      return 1
  }
}
