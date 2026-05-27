import { Prisma, PrismaClient } from '@prisma/client'

import logger from './Logger'

/**
 * @class PrismaService
 * @description Wrapper around PrismaClient that:
 * - Initializes Prisma with logging
 * - Attaches custom query methods via $extends
 * - Provides a centralized Prisma instance
 *
 * @property client - Prisma client instance (extended with custom queries)
 *
 * @method attachQueries Extends Prisma models with custom query methods
 * @method getPrismaClient Returns the current Prisma client instance
 */
class PrismaService {
    private client: any

    /**
     * @constructor
     * @description Initializes Prisma client with logging and event listeners
     */
    constructor() {
        this.client = new PrismaClient({
            log: [{
                level: 'warn',
                emit: 'event'
            }, {
                level: 'error',
                emit: 'event'
            },{
                level: 'info',
                emit: 'event'
            }]
        })

        this.client.$on('warn', (e: Prisma.LogEvent) => {
            logger.warn(`[Prisma] ${e.message}`);
        })

        this.client.$on('error', (e: Prisma.LogEvent) => {
            logger.error(`[Prisma] ${e.message}`);
        })

        this.client.$on('info', (e: Prisma.LogEvent) => {
            logger.info(`[Prisma] ${e.message}`);
        })

        logger.info('Prisma client was created')
    }

    /**
     * @method getPrismaClient
     * @description Returns the current Prisma client instance
     *
     * @returns {any} Prisma client (possibly extended)
     */
    public getPrismaClient() {
        return this.client
    }
}

const prismaService = new PrismaService()

const prisma = prismaService.getPrismaClient()

export default prisma