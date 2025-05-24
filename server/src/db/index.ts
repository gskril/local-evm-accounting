import {
  CamelCasePlugin,
  type ColumnType,
  type GeneratedAlways,
  Kysely,
  sql,
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
  name: string
  description: string | null
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
  token: number
  owner: AccountRow['address']
  balance: number
  ethValue: number
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
    onCreateConnection: (conn) => {
      conn.executeQuery(sql`PRAGMA foreign_keys = ON;`.compile(db))
    },
  }),
  plugins: [new CamelCasePlugin()],
})
