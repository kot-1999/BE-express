import { Prisma, Admin, PrismaClient } from '@prisma/client'

import { BaseQueries } from '../../../../utils/BaseQueries';

export default class AdminQueries extends BaseQueries<
    Admin,
    Prisma.AdminWhereInput,
    Prisma.AdminSelect,
    Prisma.AdminCreateInput,
    Prisma.AdminUpdateInput> {

    constructor(prismaClient: PrismaClient) {
        super(prismaClient.admin)
        this.findOne = this.findOne.bind(this)
        this.softDelete = this.softDelete.bind(this)
        this.findByID = this.findByID.bind(this)
        this.createOne = this.createOne.bind(this)
        this.updateOne = this.updateOne.bind(this)
    }
}
