import { Kysely } from 'kysely'

// Add columns to `tokens` to track ERC4626 assets
// Note: SQLite doesn't seem to support adding multiple columns in a single query
export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable('tokens')
    .addColumn('erc4626AssetAddress', 'text')
    .execute()

  await db.schema
    .alterTable('tokens')
    .addColumn('erc4626AssetDecimals', 'integer')
    .execute()
}

export const down = async (db: Kysely<any>) => {
  await db.schema
    .alterTable('tokens')
    .dropColumn('erc4626AssetAddress')
    .execute()

  await db.schema
    .alterTable('tokens')
    .dropColumn('erc4626AssetDecimals')
    .execute()
}
