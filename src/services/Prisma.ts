import { Prisma, PrismaClient } from '@prisma/client'

import logger from './Logger';
import UserQueries from '../controllers/b2c/v1/user/UserQueries'

class PrismaService {
    private client
    private userQueries: UserQueries
    constructor(userQueries: UserQueries) {
        this.userQueries = userQueries
         
        logger.info('Prisma client was created')

        const client = new PrismaClient({
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

        client.$on('warn', (e: Prisma.LogEvent) => {
            logger.warn(`[Prisma] ${e.message}`);
        })

        client.$on('error', (e: Prisma.LogEvent) => {
            logger.error(`[Prisma] ${e.message}`);
        })

        client.$on('info', (e: Prisma.LogEvent) => {
            logger.info(`[Prisma] ${e.message}`);
        })

        // NOTE: $extends client method should be used after $on
        // as extended client doesnt support $on and $use
        this.client = client.$extends({
            model: {
                user: {
                    findOne: this.userQueries.findOne,
                    softDelete: this.userQueries.softDelete
                }
            }
        })

    }

    public getPrismaClient() {
        return this.client
    }
}

const userQueries = new UserQueries()
const prismaService = new PrismaService(userQueries)
const prisma = prismaService.getPrismaClient()

export default prisma