import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import prisma from '../../../../services/Prisma'

export class UserQueries {
    /**
     * Select one user from database
     * @param select {Prisma.UserSelect | null} default prisma
     * select options, or null in case all attributes are needed
     * @param where {Prisma.UserWhereInput} default prisma where options
     * @param options additional search options
     * */
    public static selectUser(
        select: Prisma.UserSelect | null,
        where: Prisma.UserWhereInput,
        options = {
            softDeleted: false
        }
    ) {
        return prisma.user.findFirst({
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
     * Soft delete of user
     * @param userID {string} ID of user which should be soft-deleted
     * */
    public static deleteUser(userID: string) {
        return prisma.user.update({
            where: {
                id: userID
            },
            data: {
                deletedAt: dayjs().toISOString()
            }
        })
    }
}