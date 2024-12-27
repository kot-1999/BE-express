import { PrismaClient } from '@prisma/client'

class PrismaSingleton {
    private static instance: PrismaClient

    private constructor() {
        // Private constructor to prevent instantiation from outside
    }

    public static getInstance(): PrismaClient {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaClient()
        }
        return PrismaSingleton.instance
    }
}

const prisma = PrismaSingleton.getInstance()

export default prisma