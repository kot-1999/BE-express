import { Router } from 'express'

import { UsersController } from '../../controllers/b2c/v1/user/UserController'
import authorizationMiddleware from '../../middlewares/authorizationMiddleware'
import validationMiddleware from '../../middlewares/validationMiddleware'
import { PassportStrategy } from '../../utils/enums'

// Init router and controller
const router = Router()
const userController = new UsersController()

export default function authorizationRouter() {
    // List endpoints
    router.get(
        /*
            #swagger.tags = ['b2c-v1-User']
            #swagger.description = 'Get user details',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1GetUserReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1GetUserRes" },
            }
        */
        '/:userID',
        validationMiddleware(UsersController.schemas.request.getUser),
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        userController.getUser
    )

    router.delete(
        /*
            #swagger.tags = ['b2c-v1-User']
            #swagger.description = 'Delete user. User can delete only himself.',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1DeleteUserReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1DeleteUserRes" },
            }
        */
        '/',
        validationMiddleware(UsersController.schemas.request.deleteUser),
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        userController.deleteUser
    )

    return router
}
