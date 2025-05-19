import type { Insertable } from 'kysely'

import { defaultChains } from './chains'
import type { Tables } from './db'

export const defaultTokens: Insertable<Tables['tokens']>[] = [
  // Native ETH on all default chains
  ...defaultChains.map(
    (chain) =>
      ({
        address: '0x0000000000000000000000000000000000000000',
        chain: chain.id,
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      }) as const
  ),
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chain: 1,
    name: 'USDT',
    symbol: 'USDT',
    decimals: 18,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chain: 1,
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chain: 1,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    chain: 1,
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    chain: 1,
    name: 'DAI',
    symbol: 'DAI',
    decimals: 18,
  },
  {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    chain: 1,
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
  },
  {
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    chain: 1,
    name: 'Aave',
    symbol: 'AAVE',
    decimals: 18,
  },
  {
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    chain: 42161,
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
  },
  {
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    chain: 1,
    name: 'Maker',
    symbol: 'MKR',
    decimals: 18,
  },
  {
    address: '0x4200000000000000000000000000000000000042',
    chain: 10,
    name: 'Optimism',
    symbol: 'OP',
    decimals: 18,
  },
  {
    address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    chain: 1,
    name: 'ENS',
    symbol: 'ENS',
    decimals: 18,
  },
]
