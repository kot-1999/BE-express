import { Request, NextFunction, Response } from 'express'

import { IError } from '../utils/IError'

export default function authorizationMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.isAuthenticated()) {
        throw new IError(401, 'Authentication required')
    }

    return next()
}