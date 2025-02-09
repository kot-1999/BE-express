import { ValidationError, ValidationErrorItem } from 'joi'

import logger from '../services/Logger';

export class IError extends Error {
    isJoi: boolean
    statusCode: number
    message: string
    validationErrorItems: ValidationErrorItem[]

    constructor(statusCode: number, error: string | ValidationError) {
        super()
        this.statusCode = statusCode
        logger.debug(error instanceof ValidationError)

        if (typeof error === 'string') {
            this.message = error
            this.isJoi = false
        } else if(error instanceof ValidationError) {
            this.validationErrorItems = (error as ValidationError).details
            this.isJoi = true
            this.message = (error as ValidationError).message
        } else {
            this.isJoi = false
            this.message = 'Unknown error type'
        }
    }
}