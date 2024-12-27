import { PrismaClient } from '@prisma/client'

class PrismaSingleton {
    private static instance: PrismaClient

    // Private constructor to prevent initialization from outside
    private constructor() {
    }

    public static getInstance(): PrismaClient {
        // eslint-disable-next-line no-console
        console.log('Prisma client was created'.green)
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient()
        }
        return PrismaSingleton.instance
    }
}

const prisma = PrismaSingleton.getInstance()

export default prisma