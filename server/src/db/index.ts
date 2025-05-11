import Database from 'bun:sqlite'
import {
  CamelCasePlugin,
  type GeneratedAlways,
  Kysely,
  SqliteDialect,
} from 'kysely'
import type { Address } from 'viem'

interface ChainRow {
  id: number
  name: string
  rpcUrl: string
}

interface AccountRow {
  address: Address
  name: string
  chainIds: ChainRow['id'][]
  createdAt: GeneratedAlways<Date>
}

interface TokenRow {
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
}

export type Tables = {
  accounts: AccountRow
  chains: ChainRow
  tokens: TokenRow
  balances: BalanceRow
}

export const db = new Kysely<Tables>({
  dialect: new SqliteDialect({
    // @ts-expect-error Kysely is not designed to work with Bun:sqlite but it still works 🤷‍♂️
    database: new Database(
      process.env.DATABASE_URL?.replace('sqlite://', '') ?? './db.sqlite'
    ),
  }),
  plugins: [new CamelCasePlugin()],
})
