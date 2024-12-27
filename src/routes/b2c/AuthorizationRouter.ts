import express from 'express'
import passport from 'passport'

import { AuthorizationController } from '../../controllers/b2c/v1/AuthorizationController'
import validationMiddleware from '../../middlewares/validationMiddleware'

export default function authorizationRouter(url: string) {
    // Init router and controller
    const router = express.Router()
    router.use(`/${url}/v1/authorization`, router)
    const authorizationController = new AuthorizationController()

    // List endpoints
    router.post(
        '/register',
        validationMiddleware(AuthorizationController.schemas.request.register),
        authorizationController.register
    )
    router.get(
        '/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
        // validationMiddleware(AuthorizationController.schemas.request.register),
        // authorizationController.google
    )

    router.get(
        '/google/redirect',
        // validationMiddleware(AuthorizationController.schemas.request.register),
        passport.authenticate('google', { scope: ['profile', 'email'] }),
        authorizationController.googleRedirect
    )

    return router
}
