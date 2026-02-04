import { Prisma, PrismaClient } from '@prisma/client'

import logger from './Logger';
import AdminQueries from '../controllers/b2b/v1/admin/AdminQueries';
import UserQueries from '../controllers/b2c/v1/user/UserQueries'

interface Queries { user: UserQueries, admin: AdminQueries }

class PrismaService {
    private client: any
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

    public attachQueries (queries: Queries) {
        // NOTE: $extends client method should be used after $on
        // as extended client doesnt support $on and $use
        this.client = this.client.$extends({
            model: {
                user: {
                    findOne: queries.user.findOne,
                    softDelete: queries.user.softDelete,
                    findByID: queries.user.findByID,
                    createOne: queries.user.createOne,
                    updateOne: queries.user.updateOne
                },
                admin: {
                    findOne: queries.admin.findOne,
                    softDelete: queries.admin.softDelete,
                    findByID: queries.admin.findByID,
                    createOne: queries.admin.createOne,
                    updateOne: queries.admin.updateOne
                }
            }
        })
    }

    public getPrismaClient() {
        return this.client
    }
}

const prismaService = new PrismaService()

const baseClient = prismaService.getPrismaClient()

prismaService.attachQueries({
    user: new UserQueries(baseClient),
    admin: new AdminQueries(baseClient)
})

const prisma = prismaService.getPrismaClient()

export default prisma