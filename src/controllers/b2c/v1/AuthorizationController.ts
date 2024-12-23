import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

import { AbstractController } from '../../../types/AbstractController'
import { JoiCommon } from '../../../types/JoiCommon'

export class AuthorizationController extends AbstractController {
    public static readonly schemas = {
        registerSchema: JoiCommon.object.request.keys({
            body: Joi.object({
                firstName: JoiCommon.string.name.required(),
                lastName: JoiCommon.string.name.required(),
                email: JoiCommon.string.email.required()
            }).required()
        }).required()
    }

    constructor() {
        super()
    }
    
    register(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('register')

            return res.status(200).json({})
        } catch (err) {
            return next(err)
        }
    }
}