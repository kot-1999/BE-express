import { Router } from 'express'
import passport from 'passport'

import { AuthorizationController } from '../../controllers/b2c/v1/authorization/AuthorizationController'
import authorizationMiddleware from '../../middlewares/authorizationMiddleware'
import validationMiddleware from '../../middlewares/validationMiddleware'
import { PassportStrategy } from '../../utils/enums'

// Init router and controller
const router = Router()
const authorizationController = new AuthorizationController()

export default function userAuthorizationRouter() {
    // List endpoints
    router.post(
        /*
            #swagger.tags = ['b2c-v1-UserAuthorization']
            #swagger.description = 'Register a new user.',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1RegisterReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1RegisterRes" }
            }
        */
        '/register',
        validationMiddleware(AuthorizationController.schemas.request.register),
        authorizationController.register
    )
    router.post(
        /*
            #swagger.tags = ['b2c-v1-UserAuthorization']
            #swagger.description = 'Authorize a user',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1LoginReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1LoginRes" }
            }
        */
        '/login',
        validationMiddleware(AuthorizationController.schemas.request.login),
        authorizationController.login
    )
    router.get(
        /*
            #swagger.tags = ['b2c-v1-UserAuthorization']
            #swagger.description = 'Google OAuth2 endpoint',
        */
        '/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    )

    router.get(
        /*
            #swagger.tags = ['b2c-v1-UserAuthorization']
            #swagger.description = 'Google OAuth2 redirect endpoint',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1GoogleRedirectReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1GoogleRedirectRes" }
            }
        */
        '/google/redirect',
        passport.authenticate('google'),
        authorizationController.googleRedirect
    )

    router.get(
        /*
            #swagger.tags = ['b2c-v1-UserAuthorization']
            #swagger.description = 'Logout a user.',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1LogoutReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1LogoutRes" }
            }
        */
        '/logout',
        authorizationMiddleware([PassportStrategy.jwtB2c, PassportStrategy.google]),
        authorizationController.logout
    )

    router.post(
        /*
           #swagger.tags = ['b2c-v1-UserAuthorization']
           #swagger.description = 'Send email with password reset link.',
           #swagger.parameters['body'] = {
               in: 'body',
               schema: { $ref: '#/definitions/b2cV1ForgotPasswordReqBody' }
           }
           #swagger.responses[200] = {
               schema: { "$ref": "#/definitions/b2cV1ForgotPasswordRes" }
           }
       */
        '/forgot-password',
        validationMiddleware(AuthorizationController.schemas.request.forgotPassword),
        authorizationController.forgotPassword
    )

    router.post(
        /*
           #swagger.tags = ['b2c-v1-UserAuthorization']
           #swagger.description = 'Resets a password.',
           #swagger.parameters['body'] = {
               in: 'body',
               schema: { $ref: '#/definitions/b2cV1ResetPasswordReqBody' }
           }
           #swagger.responses[200] = {
               schema: { "$ref": "#/definitions/b2cV1ResetPasswordRes" }
           }
       */
        '/reset-password',
        validationMiddleware(AuthorizationController.schemas.request.resetPassword),
        authorizationMiddleware([PassportStrategy.jwtB2cForgotPassword, PassportStrategy.google]),
        authorizationController.resetPassword
    )
    return router
}
