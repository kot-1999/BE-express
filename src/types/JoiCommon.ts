import Joi from 'joi'

import { Constants } from '../utils/Constants'

export class JoiCommon {
    static readonly string = {
        id: Joi.string().uuid()
            .required(),
        name: Joi.string()
            .trim()
            .pattern(/^[a-zA-Z0-9\s'&.,-]+$/)
            .min(Constants.number.MIN_NAME_LENGTH)
            .max(Constants.number.MAX_STRING_LENGTH)
            .required(),
        companyName: Joi.string().min(5)
            .max(200)
            .required(),
        email: Joi.string().email()
            .trim()
            .case('lower'),
        token: Joi.string()
    }

    static readonly number = {

    }

    static readonly object = {
        request: Joi.object({
            query: Joi.object(),
            body: Joi.object(),
            params: Joi.object(),
            headers: Joi.object()
        }),

        address: Joi.object({
            building: Joi.string().trim()
                .min(1)
                .required(),

            street: Joi.string().trim()
                .min(1)
                .required(),

            city: Joi.string().trim()
                .min(1)
                .required(),

            postcode: Joi.string().trim()
                .min(1)
                .required(),

            country: Joi.string().trim()
                .min(1)
                .required(),

            latitude: Joi.number()
                .min(-90)
                .max(90)
                .precision(6)
                .required(),

            longitude: Joi.number()
                .min(-180)
                .max(180)
                .precision(6)
                .required()
        }),

        pagination: Joi.object({
            page: Joi.number()
                .integer()
                .min(1)
                .required(),

            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .required(),

            total: Joi.number()
                .integer()
                .min(0)
                .required()
        })
    }
}