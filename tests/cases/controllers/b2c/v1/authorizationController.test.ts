import { User } from '@prisma/client'
import { expect } from 'chai'
import supertest from 'supertest'

import app from '../../../../../src/app'
import { AuthorizationController } from '../../../../../src/controllers/b2c/v1/AuthorizationController'
import { EncryptionService } from '../../../../../src/services/Encryption'
import prisma from '../../../../../src/services/Prisma'

const endpoint = (val: string = '') => '/api/b2c/v1/authorization' + val

const newUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    password: EncryptionService.encryptAES('Test123.')
}
describe(endpoint('/register'), () => {
    it('should register user (200)', async () => {
        
        const res = await supertest(app).post(endpoint('/register'))
            .send(newUserData)
        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')
        expect(res.body.user.id).to.be.an('string')

        const validationResult = AuthorizationController.schemas.response.register.validate(res.body)
        expect(validationResult.error).to.eq(undefined)

        const newUser = await prisma.user.findFirst({
            where: {
                id: res.body.user.id
            }
        })

        expect(newUser).not.to.eq(null)
        expect(newUser?.email).to.eq(newUserData.email)
    })

    it('user already exists (409)', async () => {

        const res = await supertest(app).post(endpoint('/register'))
            .send(newUserData)

        expect(res.statusCode).to.equal(409)
        expect(res.type).to.eq('application/json')
    })
})

describe(endpoint('/login'), () => {
    it('should login user (200)', async () => {

        const res = await supertest(app).post(endpoint('/login'))
            .send({
                email: newUserData.email,
                password: newUserData.password
            })

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.login.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('wrong email (401)', async () => {

        const res = await supertest(app).post(endpoint('/login'))
            .send({
                email: 'test@gmail.com',
                password: newUserData.password
            })

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })

    it('wrong password (401)', async () => {

        const res = await supertest(app).post(endpoint('/login'))
            .send({
                email: newUserData.email,
                password: EncryptionService.encryptAES('Test123.wrong')
            })

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })
})
