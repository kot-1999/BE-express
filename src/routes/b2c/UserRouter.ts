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
        '/:userID',
        validationMiddleware(UsersController.schemas.request.getUser),
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        userController.getUser
    )

    router.delete(
        '/:userID',
        validationMiddleware(UsersController.schemas.request.deleteUser),
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        userController.deleteUser
    )

    return router
}
