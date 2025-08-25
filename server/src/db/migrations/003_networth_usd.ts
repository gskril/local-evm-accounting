import { Kysely } from 'kysely'

// Add usdValue column to networth snapshots
export const up = async (db: Kysely<any>) => {
  await db.schema
    .alterTable('networth')
    .addColumn('usdValue', 'integer')
    .execute()
}

export const down = async (db: Kysely<any>) => {
  await db.schema.alterTable('networth').dropColumn('usdValue').execute()
}

