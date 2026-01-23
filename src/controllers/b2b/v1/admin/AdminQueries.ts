import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import prisma from '../../../../services/Prisma'

export default class AdminQueries {
    /**
     * Select one admin from database
     * @param select {Prisma.AdminSelect | null} default prisma
     * select options, or null in case all attributes are needed
     * @param where {Prisma.AdminWhereInput} default prisma where options
     * @param options additional search options
     * */
    public findOne(
        select: Prisma.AdminSelect | null,
        where: Prisma.AdminWhereInput,
        options = {
            softDeleted: false
        }
    ) {
        return prisma.admin.findFirst({
            select,
            where: {
                ...where,
                deletedAt: options.softDeleted ? {
                    not: null
                } : {
                    equals: null
                }
            }
        })
    }

    /**
     * Soft delete of admin
     * @param adminID {string} ID of admin which should be soft-deleted
     * */
    public softDelete(adminID: string) {
        return prisma.admin.update({
            where: {
                id: adminID
            },
            data: {
                deletedAt: dayjs().toISOString()
            }
        })
    }
}
