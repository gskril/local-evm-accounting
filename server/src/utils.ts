import type { Address } from 'viem'

export function truncateAddress(address: Address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function estimateBlockNumber(timestamp: Date) {
  const blockTime = 12.079
  // Block before this project was released, so we never need a date before that
  const startingBlock = 22600000
  const startingTimestamp = new Date('2025-05-31T03:22:47Z')

  const diff = timestamp.getTime() - startingTimestamp.getTime()
  const diffInBlocks = diff / (blockTime * 1000)
  return BigInt(Math.floor(startingBlock + diffInBlocks))
}
