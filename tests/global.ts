import 'dotenv'

import prisma from '../src/services/Prisma'

export async function clearDatabase() {
    const tables: { tablename: string }[] = await prisma
        .$queryRaw`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public';`

    // Disable constraints, truncate all tables, and re-enable constraints
    for (const { tablename } of tables) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`)
        }
    }
}

export const mochaHooks = async () => {
    await clearDatabase()
}

export function mochaGlobalSetup() {
}
