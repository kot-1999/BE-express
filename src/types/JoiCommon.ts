import Joi from 'joi'

import { Constants } from '../utils/Constants'

export class JoiCommon {
    static readonly string = {
        id: Joi.string().uuid()
            .required(),
        name: Joi.string().trim()
            .alphanum()
            .allow('\'', '-')
            .min(Constants.number.MIN_NAME_LENGTH)
            .max(Constants.number.MAX_STRING_LENGTH),
        email: Joi.string().email()
            .trim()
            .case('lower')
    }

    static readonly number = {}

    static readonly object = {
        request: Joi.object({
            query: Joi.object(),
            body: Joi.object(),
            params: Joi.object(),
            headers: Joi.object()
        })
    }
}