import {
  CamelCasePlugin,
  type ColumnType,
  type GeneratedAlways,
  Kysely,
  Migrator,
  sql,
} from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-worker/normal'
import type { Address } from 'viem'

import { isDocker } from '../docker'
import { migrator } from './migrator'

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

interface NetworthRow {
  timestamp: ColumnType<Date, never, string>
  ethValue: number
}

export type Tables = {
  accounts: AccountRow
  chains: ChainRow
  tokens: TokenRow
  balances: BalanceRow
  networth: NetworthRow
}

async function createDatabase() {
  const db = new Kysely<Tables>({
    dialect: new BunSqliteDialect({
      url: isDocker() ? '/app/data/db.sqlite' : 'db.sqlite',
    }),
    plugins: [new CamelCasePlugin()],
  })

  await sql`PRAGMA foreign_keys = ON`.execute(db)

  const doit = new Migrator({
    db,
    provider: migrator,
  })

  await doit.migrateToLatest()
  console.log('Ran db migrations')
  return db
}

export const db = await createDatabase()
