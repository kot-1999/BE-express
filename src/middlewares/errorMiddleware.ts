import { NextFunction, Request, Response } from 'express'

import logger from '../services/logger';
import { IError } from '../utils/IError'

export default function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
    logger.error(err.message, err)

    let messages = []
    let code = 500

    if (err instanceof IError) {
        code = err.statusCode

        if (err.isJoi) {
            messages = err.validationErrorItems
        } else {
            messages.push(err.message)
        }
    } else {
        messages.push(err.message)
    }

    // return error response
    return res.status(code).json({ messages })
}