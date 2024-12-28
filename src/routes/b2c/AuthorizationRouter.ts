import { Router } from 'express'
import passport from 'passport'

import { AuthorizationController } from '../../controllers/b2c/v1/AuthorizationController'
import authorizationMiddleware from '../../middlewares/authorizationMiddleware'
import validationMiddleware from '../../middlewares/validationMiddleware'

// Init router and controller
const router = Router()
const authorizationController = new AuthorizationController()

export default function authorizationRouter() {
    // List endpoints
    router.post(
        '/register',
        validationMiddleware(AuthorizationController.schemas.request.register),
        authorizationController.register
    )
    router.get(
        '/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    )

    router.get(
        '/google/redirect',
        // validationMiddleware(AuthorizationController.schemas.request.register),
        passport.authenticate('google'),
        authorizationController.googleRedirect
    )

    router.get(
        '/logout',
        authorizationMiddleware,
        authorizationController.logout
    )
    return router
}
