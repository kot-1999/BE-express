import { Prisma, PrismaClient } from '@prisma/client'

import logger from './Logger';
import AdminQueries from '../controllers/b2b/v1/admin/AdminQueries';
import UserQueries from '../controllers/b2c/v1/user/UserQueries'

interface Queries { user: UserQueries, admin: AdminQueries }

class PrismaService {
    private client
    private queries: Queries
    constructor(queries: Queries) {
        this.queries = queries

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
                    findOne: this.queries.user.findOne,
                    softDelete: this.queries.user.softDelete
                },
                admin: {
                    findOne: this.queries.admin.findOne,
                    softDelete: this.queries.admin.softDelete
                }
            }
        })

        logger.info('Prisma client was created')
    }

    public getPrismaClient() {
        return this.client
    }
}

const prismaService = new PrismaService({
    user: new UserQueries(),
    admin: new AdminQueries() 
})
const prisma = prismaService.getPrismaClient()

export default prisma