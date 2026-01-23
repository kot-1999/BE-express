import { NextFunction, Request, Response } from 'express'
import passport from 'passport'

import { PassportStrategy } from '../utils/enums'
import { IError } from '../utils/IError'

export default function authorizationMiddleware(allowedStrategies: PassportStrategy[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // If user is using passport-google-oauth-20 strategy
        if (allowedStrategies.includes(PassportStrategy.google) && req.isAuthenticated()) {
            return next()
        }

        // If user is using some of JWT strategies
        if (allowedStrategies.includes(PassportStrategy.jwtB2c)) {
            return passport.authenticate(PassportStrategy.jwtB2c, { session: false })(req, res, next)
        } else if (allowedStrategies.includes(PassportStrategy.jwtB2cForgotPassword)) {
            return passport.authenticate(PassportStrategy.jwtB2cForgotPassword, { session: false })(req, res, next)
        } else if (allowedStrategies.includes(PassportStrategy.jwtB2b)) {
            return passport.authenticate(PassportStrategy.jwtB2b, { session: false })(req, res, next)
        } else if (allowedStrategies.includes(PassportStrategy.jwtB2bForgotPassword)) {
            return passport.authenticate(PassportStrategy.jwtB2bForgotPassword, { session: false })(req, res, next)
        } else {
            throw new IError(401, 'Authentication required')
        }
    }
}