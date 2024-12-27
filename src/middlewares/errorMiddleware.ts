import { Request, Response } from 'express'

import { IError } from '../utils/IError'

export default function errorMiddleware(err: Error, req: Request, res: Response, _next: NewableFunction) {
    // log an error
    console.log('ERROR_MIDDLEWARE:', err.message)

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