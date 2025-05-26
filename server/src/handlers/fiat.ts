import type { Context } from 'hono'

import { getRateToEth } from '../price'

export async function getFiat(c: Context) {
  try {
    const [usd, eur] = await Promise.all([
      getRateToEth({
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        chainId: 1,
      }),
      getRateToEth({
        address: '0x1abaea1f7c830bd89acc67ec4af516284b1bc33c',
        decimals: 6,
        chainId: 1,
      }),
    ])

    const data = { usd, eur, eth: 1 }

    const array = Object.entries(data).map(([key, value]) => ({
      label: key.toUpperCase(),
      rateToEth: value,
    }))

    return c.json(array)
  } catch {
    return c.json([
      {
        label: 'ETH',
        rateToEth: 1,
      },
    ])
  }
}
