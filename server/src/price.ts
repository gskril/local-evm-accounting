import { type Address, formatEther, parseAbi } from 'viem'

import { getViemClient } from './chains'

// https://portal.1inch.dev/documentation/contracts/spot-price-aggregator/introduction
const SPOT_PRICE_AGGREGATOR = {
  address: '0x0AdDd25a91563696D8567Df78D5A01C9a991F9B8',
  abi: parseAbi([
    'function getRateToEth(address srcToken, bool useSrcWrappers) external view returns (uint256 weightedRate)',
  ]),
} as const

type Props = {
  address: Address
  chainId: number
  decimals: number
}

export async function getRateToEth({ address, chainId, decimals }: Props) {
  const client = await getViemClient(chainId)

  const rate = await client.readContract({
    ...SPOT_PRICE_AGGREGATOR,
    functionName: 'getRateToEth',
    args: [address, true],
  })

  const numerator = BigInt(10 ** decimals)
  const denominator = BigInt(10 ** 18) // 18 for ETH decimals
  const priceInEth = (rate * numerator) / denominator

  return Number(formatEther(priceInEth))
}
