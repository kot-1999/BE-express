import { faker } from '@faker-js/faker'
import { User, UserType } from '@prisma/client'
import dayjs from 'dayjs'

import { EncryptionService } from '../../src/services/Encryption'
import prisma from '../../src/services/Prisma'

export default class UserGenerator {
    public static generateUser(userData: Partial<User> = {}): Promise<User> {
        return prisma.user.createOne(UserGenerator.generateData(userData))
    }

    public static generateData(userData: Partial<User> = {}): User {
        return {
            id: userData.id ?? faker.string.uuid(),
            firstName: userData.firstName ?? faker.person.firstName(),
            lastName: userData.lastName ?? faker.person.lastName(),
            email: userData.email ?? faker.internet.email(),
            emailVerified: userData.emailVerified ?? false,
            password: userData.password ?? EncryptionService.hashSHA256(faker.internet.password()),
            type: userData.type ?? UserType.Default,
            googleProfileID: userData.googleProfileID ?? null,
            createdAt: userData.createdAt as Date ?? dayjs().toISOString(),
            updatedAt: userData.updatedAt as Date ?? dayjs().toISOString(),
            deletedAt: userData.deletedAt ?? null
        }
    }
}
