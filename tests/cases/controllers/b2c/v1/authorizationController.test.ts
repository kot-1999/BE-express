import { User } from '@prisma/client'
import { expect } from 'chai'
import config from 'config'
import supertest from 'supertest'

import app from '../../../../../src/app'
import { AuthorizationController } from '../../../../../src/controllers/b2c/v1/authorization/AuthorizationController'
import { UserQueries } from '../../../../../src/controllers/b2c/v1/user/UserQueries'
import { EncryptionService } from '../../../../../src/services/Encryption'
import { JwtService } from '../../../../../src/services/Jwt'
import { IConfig } from '../../../../../src/types/config'
import { JwtAudience } from '../../../../../src/utils/enums'

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
            .set('Content-Type', 'application/json')
            .send(newUserData)
        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')
        expect(res.body.user.id).to.be.an('string')

        const validationResult = AuthorizationController.schemas.response.register.validate(res.body)
        expect(validationResult.error).to.eq(undefined)

        const newUser = await UserQueries.selectUser(null, {
            id: res.body.user.id
        })

        expect(newUser).not.to.eq(null)
        expect(newUser?.email).to.eq(newUserData.email)
    })

    it('user already exists (409)', async () => {

        const res = await supertest(app).post(endpoint('/register'))
            .set('Content-Type', 'application/json')
            .send(newUserData)

        expect(res.statusCode).to.equal(409)
        expect(res.type).to.eq('application/json')
    })
})

const cookieSessionConfig = config.get<IConfig['cookieSession']>('cookieSession')
let sessionCookie: string

describe(endpoint('/login'), () => {
    it('should login user (200)', async () => {
        const res = await supertest(app).post(endpoint('/login'))
            .set('Content-Type', 'application/json')
            .send({
                email: newUserData.email,
                password: newUserData.password
            })

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.login.validate(res.body)
        expect(validationResult.error).to.eq(undefined)

        expect(res.headers['set-cookie']).to.exist

        // Extract session cookie
        sessionCookie = res.headers['set-cookie'][0]
        expect(sessionCookie).to.include(cookieSessionConfig.name)
    })

    it('wrong email (401)', async () => {

        const res = await supertest(app).post(endpoint('/login'))
            .set('Content-Type', 'application/json')
            .send({
                email: 'test@gmail.com',
                password: newUserData.password
            })

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })

    it('wrong password (401)', async () => {

        const res = await supertest(app).post(endpoint('/login'))
            .set('Content-Type', 'application/json')
            .send({
                email: newUserData.email,
                password: EncryptionService.encryptAES('Test123.wrong')
            })

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })
})

describe(endpoint('/logout'), () => {
    it('should logout user (200)', async () => {
        const res = await supertest(app)
            .get(endpoint('/logout'))
            .set('Content-Type', 'application/json')
            .set('Cookie', sessionCookie)

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.logout.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('logged out user does not have access to app anymore (401)', async () => {
        const res = await supertest(app)
            .get(endpoint('/logout'))
            .set('Content-Type', 'application/json')
            .set('Cookie', sessionCookie)

        expect(res.statusCode).to.equal(401)
    })
})

describe(endpoint('/forgot-password'), () => {
    it('should send email to given address (200)', async () => {
        const res = await supertest(app)
            .post(endpoint('/forgot-password'))
            .set('Content-Type', 'application/json')
            .send({
                email: newUserData.email
            })

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.forgotPassword.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('should not send email as email address is unknown (200)', async () => {
        const res = await supertest(app)
            .post(endpoint('/forgot-password'))
            .set('Content-Type', 'application/json')
            .send({
                email: 'random.test.email@gmail.com'
            })

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.forgotPassword.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })
})

describe(endpoint('/reset-password'), () => {
    let user: User
    before(async () => {
        const dbUser = await UserQueries.selectUser(null, {
            email: newUserData.email
        })

        if (!dbUser) {
            throw new Error('User not found reset-password test')
        } else {
            user = dbUser
        }
    })
    
    it('should reset password (200)', async () => {
        const newPassword = EncryptionService.encryptAES('Test123.newPassword')
        const res = await supertest(app)
            .post(endpoint('/reset-password'))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: user.id,
                aud: JwtAudience.forgotPassword
            })}`)
            .send({
                newPassword
            })

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = AuthorizationController.schemas.response.resetPassword.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('wrong aud in jwt token (401)', async () => {
        const newPassword = EncryptionService.encryptAES('Test123.newPassword')
        const res = await supertest(app)
            .post(endpoint('/reset-password'))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: user.id,
                aud: JwtAudience.b2c
            })}`)
            .send({
                newPassword
            })

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })
})
