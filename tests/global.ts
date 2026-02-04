import 'dotenv'

import seed from '../scripts/seed';
import prisma from '../src/services/Prisma'

// Function to truncate all tables except _prisma_migrations
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

// Mocha hook executed before all tests
export const mochaHooks = async () => {
    await clearDatabase()
    
    await seed()
}

export function mochaGlobalSetup() {
}
