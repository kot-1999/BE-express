import { faker } from '@faker-js/faker'
import { expect } from 'chai'
import supertest from 'supertest'

import app from '../../../../../src/app'
import { UsersController } from '../../../../../src/controllers/b2c/v1/user/UserController';
import { JwtService } from '../../../../../src/services/Jwt';
import prisma from '../../../../../src/services/Prisma';
import { JwtAudience } from '../../../../../src/utils/enums';
import UserGenerator from '../../../../utils/UserGenerator'

const endpoint = (val: string = '') => '/api/b2c/v1/user/' + val

describe('GET ' + endpoint(':userID'), () => {
    let userID: string

    it('Wrong JWT token aud (401)', async () => {
        const user = await UserGenerator.generateUser()
        userID = user.id
        const res = await supertest(app)
            .get(endpoint(user.id))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: user.id,
                aud: JwtAudience.b2b
            })}`)

        expect(res.statusCode).to.equal(401)
        expect(res.type).to.eq('application/json')
    })

    it('Should return himself (200)', async () => {
        const res = await supertest(app)
            .get(endpoint(userID))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: userID,
                aud: JwtAudience.b2c
            })}`)

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = UsersController.schemas.response.getUser.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('Should return another user (200)', async () => {
        const user = await UserGenerator.generateUser()
        const res = await supertest(app)
            .get(endpoint(userID))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: user.id,
                aud: JwtAudience.b2c
            })}`)

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = UsersController.schemas.response.getUser.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
    })

    it('Should not find user (404)', async () => {
        const res = await supertest(app)
            .get(endpoint(faker.string.uuid()))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: userID,
                aud: JwtAudience.b2c
            })}`)

        expect(res.statusCode).to.equal(404)
        expect(res.type).to.eq('application/json')
    })
})

describe('DELETE ' + endpoint(), () => {
    it('Should delete user (200)', async () => {
        const user = await UserGenerator.generateUser()
        const res = await supertest(app)
            .delete(endpoint(''))
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${JwtService.generateToken({
                id: user.id,
                aud: JwtAudience.b2c
            })}`)

        expect(res.statusCode).to.equal(200)
        expect(res.type).to.eq('application/json')

        const validationResult = UsersController.schemas.response.deleteUser.validate(res.body)
        expect(validationResult.error).to.eq(undefined)
        
        expect(!!(await prisma.user.findOne(null, { id: user.id }))).to.equal(false)
    })
})