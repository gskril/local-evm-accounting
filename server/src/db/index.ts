import {
  CamelCasePlugin,
  type ColumnType,
  type GeneratedAlways,
  Kysely,
} from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-worker/normal'
import type { Address } from 'viem'

interface ChainRow {
  id: number
  name: string
  rpcUrl: string
}

interface AccountRow {
  address: Address
  chainId: ChainRow['id']
  name: string
  createdAt: GeneratedAlways<Date>
}

interface TokenRow {
  id: GeneratedAlways<number>
  address: Address
  chain: ChainRow['id']
  name: string
  symbol: string
  decimals: number
}

interface BalanceRow {
  token: TokenRow['address']
  chain: ChainRow['id']
  owner: AccountRow['address']
  balance: number
  usdValue: number
  updatedAt: ColumnType<Date, never, string | undefined>
}

export type Tables = {
  accounts: AccountRow
  chains: ChainRow
  tokens: TokenRow
  balances: BalanceRow
}

export const db = new Kysely<Tables>({
  dialect: new BunSqliteDialect({
    url: process.env.DATABASE_URL?.replace('sqlite://', '') ?? './db.sqlite',
  }),
  plugins: [new CamelCasePlugin()],
})
