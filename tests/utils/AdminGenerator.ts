import { faker } from '@faker-js/faker'
import { Admin, AdminRole } from '@prisma/client'
import dayjs from 'dayjs'

import { EncryptionService } from '../../src/services/Encryption'
import prisma from '../../src/services/Prisma'

export default class AdminGenerator {
    public static generateAdmin(adminData: Partial<Admin> = {}): Promise<Admin> {
        return prisma.admin.createOne(AdminGenerator.generateData(adminData))
    }

    public static generateData(adminData: Partial<Admin> = {}): Admin {
        return {
            id: adminData.id ?? faker.string.uuid(),
            firstName: adminData.firstName ?? faker.person.firstName(),
            lastName: adminData.lastName ?? faker.person.lastName(),
            email: adminData.email ?? faker.internet.email(),
            emailVerified: adminData.emailVerified ?? false,
            password: adminData.password ?? EncryptionService.hashSHA256(faker.internet.password()),
            role: adminData.role ?? AdminRole.Admin,
            createdAt: adminData.createdAt as Date ?? dayjs().toISOString(),
            updatedAt: adminData.updatedAt as Date ?? dayjs().toISOString(),
            deletedAt: adminData.deletedAt ?? null
        }
    }
}
