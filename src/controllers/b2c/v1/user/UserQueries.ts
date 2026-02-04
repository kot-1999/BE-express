import { Prisma, User, PrismaClient } from '@prisma/client'
import { BaseQueries } from '../../../../utils/BaseQueries';

export default class UserQueries extends BaseQueries<
    User,
    Prisma.UserWhereInput,
    Prisma.UserSelect,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput> {

    constructor(prismaClient: PrismaClient) {
        super(prismaClient.user)
        this.findOne = this.findOne.bind(this)
        this.softDelete = this.softDelete.bind(this)
        this.findByID = this.findByID.bind(this)
        this.createOne = this.createOne.bind(this)
        this.updateOne = this.updateOne.bind(this)
    }
}
