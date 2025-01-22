import { Router } from 'express'
import passport from 'passport'

import { AuthorizationController } from '../../controllers/b2c/v1/AuthorizationController'
import authorizationMiddleware from '../../middlewares/authorizationMiddleware'
import validationMiddleware from '../../middlewares/validationMiddleware'
import { PassportStrategy } from '../../utils/enums'

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
    router.post(
        '/login',
        validationMiddleware(AuthorizationController.schemas.request.login),
        authorizationController.login
    )
    router.get(
        '/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    )

    router.get(
        '/google/redirect',
        passport.authenticate('google'),
        authorizationController.googleRedirect
    )

    router.get(
        '/logout',
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        authorizationController.logout
    )

    router.post(
        '/forgot-password',
        validationMiddleware(AuthorizationController.schemas.request.forgotPassword),
        authorizationController.forgotPassword
    )

    router.post(
        '/reset-password',
        authorizationMiddleware([PassportStrategy.jwtB2cForgotPassword, PassportStrategy.google]),
        validationMiddleware(AuthorizationController.schemas.request.resetPassword),
        authorizationController.resetPassword
    )
    return router
}
