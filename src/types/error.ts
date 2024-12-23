import { ValidationErrorItem } from 'joi'

export class IError extends Error {
    isJoi: boolean
    statusCode: number
    message: string
    validationErrorItems: ValidationErrorItem[]

    constructor(statusCode: number, message: string | ValidationErrorItem[]) {
        super()
        this.statusCode = statusCode

        if (typeof message === 'string') {
            this.message = message
            this.isJoi = false
        } else {
            this.validationErrorItems = message
            this.isJoi = true
        }
    }
}