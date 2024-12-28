import { Router } from 'express'

import { UsersController } from '../../controllers/b2c/v1/UserController'
import validationMiddleware from '../../middlewares/validationMiddleware'

// Init router and controller
const router = Router()
const userController = new UsersController()

export default function authorizationRouter() {
    // List endpoints
    router.get(
        '/:userID',
        // passport.authenticate('google', { scope: ['profile'] }),
        validationMiddleware(UsersController.schemas.request.getUser),
        userController.getUser
    )

    return router
}
