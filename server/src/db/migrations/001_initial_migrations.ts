import { Kysely, sql } from 'kysely'

export const up = async (db: Kysely<any>) => {
  // CHAINS
  await db.schema
    .createTable('chains')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('rpcUrl', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`current_timestamp`)
    )
    .execute()

  // ACCOUNTS
  await db.schema
    .createTable('accounts')
    .ifNotExists()
    .addColumn('address', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('chainId', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`current_timestamp`)
    )
    .addForeignKeyConstraint('accounts_chainId_fkey', ['chainId'], 'chains', [
      'id',
    ])
    .addUniqueConstraint('accounts_address_chainId_unique', [
      'address',
      'chainId',
    ])
    .execute()

  // TOKENS
  await db.schema
    .createTable('tokens')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('chain', 'integer', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('symbol', 'text', (col) => col.notNull())
    .addColumn('decimals', 'integer', (col) => col.notNull())
    .addUniqueConstraint('tokens_address_chain_unique', ['address', 'chain'])
    .addForeignKeyConstraint('tokens_chain_fkey', ['chain'], 'chains', ['id'])
    .execute()

  // BALANCES
  await db.schema
    .createTable('balances')
    .ifNotExists()
    .addColumn('token', 'integer', (col) => col.notNull())
    .addColumn('chain', 'integer', (col) => col.notNull())
    .addColumn('owner', 'text', (col) => col.notNull())
    .addColumn('balance', 'integer', (col) => col.notNull())
    .addColumn('usdValue', 'integer', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`current_timestamp`)
    )
    .addPrimaryKeyConstraint('balances_pkey', ['token', 'chain', 'owner'])
    .addForeignKeyConstraint('balances_token_fkey', ['token'], 'tokens', ['id'])
    .addForeignKeyConstraint('balances_chain_fkey', ['chain'], 'chains', ['id'])
    .addForeignKeyConstraint('balances_owner_fkey', ['owner'], 'accounts', [
      'address',
    ])
    .execute()
}

export const down = async (db: Kysely<any>) => {
  // Delete in reverse order of above so that foreign keys are not violated.
  await db.schema.dropTable('balances').ifExists().execute()
  await db.schema.dropTable('tokens').ifExists().execute()
  await db.schema.dropTable('accounts').ifExists().execute()
  await db.schema.dropTable('chains').ifExists().execute()
}
