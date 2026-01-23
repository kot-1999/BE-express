import { faker } from '@faker-js/faker'
import { Admin, AdminRole } from '@prisma/client'
import dayjs from 'dayjs'

import { EncryptionService } from '../../src/services/Encryption'
import prisma from '../../src/services/Prisma'

export default class AdminGenerator {
    public static generateAdmin(admin: Partial<Admin> = {}): Promise<Admin> {
        return prisma.admin.create({
            data: {
                id: admin.id ?? faker.string.uuid(),
                firstName: admin.firstName ?? faker.person.firstName(),
                lastName: admin.lastName ?? faker.person.lastName(),
                email: admin.email ?? faker.internet.email(),
                emailVerified: admin.emailVerified ?? false,
                password: admin.password ?? EncryptionService.hashSHA256(faker.internet.password()),
                role: admin.role ?? AdminRole.Admin,
                createdAt: admin.createdAt ?? dayjs().toISOString(),
                updatedAt: admin.updatedAt ?? dayjs().toISOString(),
                deletedAt: admin.deletedAt ?? null
            }
        })
    }
}
