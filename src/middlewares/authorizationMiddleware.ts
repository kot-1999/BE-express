import { Request, NextFunction, Response } from 'express'

import { JwtService } from '../services/Jwt'
import { IError } from '../utils/IError'

export default function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    // If user is using passport-google-oauth-20
    if (req.isAuthenticated()) {
        return next()
    }

    // If user is using JWT
    const token = req.cookies.jwt
    if (token) {
        JwtService.verifyToken(token)
        return next()
    }

    throw new IError(401, 'Authentication required')
}