import { Request, Response, NextFunction } from 'express'
import { Schema } from 'joi'

import { IError } from '../utils/IError'

export default function validationMiddleware(schema: Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!schema) {
            throw new Error('Validation schema is not provided')
        }
        const { query, body, params, headers } = req

        /**
         * @Note For requests with low variability of schemas
         * try to use "cache: true" option
         * */
        const result = schema.validate({ 
            query,
            body,
            params,
            headers
        }, {
            abortEarly: false
        })

        // Throw an error in case of unsuccessful validation
        if (result.error) {
            throw new IError(400, result.error.details)
        }

        req.body = result.value.body
        req.query = result.value.query
        req.params = result.value.params
        req.headers = result.value.headers

        return next()
    }
}