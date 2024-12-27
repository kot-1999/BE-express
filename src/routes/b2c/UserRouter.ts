import express from 'express'
import passport from 'passport'

import { UsersController } from '../../controllers/b2c/v1/UserController'
import validationMiddleware from '../../middlewares/validationMiddleware'

export default function authorizationRouter(url: string) {
    // Init router and controller
    const router = express.Router()
    router.use(`/${url}/v1/authorization`, router)
    const userController = new UsersController()

    // List endpoints
    router.get(
        '/google',
        passport.authenticate('google'),
        validationMiddleware(UsersController.schemas.request.getUser),
        userController.getUser
    )

    return router
}
