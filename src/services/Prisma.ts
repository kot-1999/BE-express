import { PrismaClient } from '@prisma/client'

import UserQueries from '../controllers/b2c/v1/user/UserQueries'

class PrismaService {
    private client
    private userQueries: UserQueries
    constructor(userQueries: UserQueries) {
        this.userQueries = userQueries
        // eslint-disable-next-line no-console
        console.log('Prisma client was created'.green)

        this.client = new PrismaClient().$extends({
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