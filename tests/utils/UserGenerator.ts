import { faker } from '@faker-js/faker'
import { User, UserType } from '@prisma/client'
import dayjs from 'dayjs'

import { EncryptionService } from '../../src/services/Encryption'
import prisma from '../../src/services/Prisma'

export default class UserGenerator {
    public static generateUser(user: Partial<User> = {}): Promise<User> {
        return prisma.user.create({
            data: {
                id: user.id ?? faker.string.uuid(),
                firstName: user.firstName ?? faker.person.firstName(),
                lastName: user.lastName ?? faker.person.lastName(),
                email: user.email ?? faker.internet.email(),
                emailVerified: user.emailVerified ?? false,
                password: user.password ?? EncryptionService.hashSHA256(faker.internet.password()),
                type: user.type ?? UserType.Default,
                googleProfileID: user.googleProfileID ?? null,
                createdAt: user.createdAt ?? dayjs().toISOString(),
                updatedAt: user.updatedAt
            }
        })
    }
}
