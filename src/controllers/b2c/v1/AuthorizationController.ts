import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

import { AbstractController } from '../../../types/AbstractController'
import { JoiCommon } from '../../../types/JoiCommon'

export class AuthorizationController extends AbstractController {
    public static readonly schemas = {
        request: {
            register: JoiCommon.object.request.keys({
                body: Joi.object({
                    firstName: JoiCommon.string.name.required(),
                    lastName: JoiCommon.string.name.required(),
                    email: JoiCommon.string.email.required(),
                    password: Joi.string().required()
                }).required()
            }).required(),

            login: JoiCommon.object.request.keys({
                body: Joi.object({
                    email: JoiCommon.string.email.required(),
                    password: Joi.string().required()
                })
            }),

            forgotPassword: JoiCommon.object.request.keys({
                body: Joi.object({
                    email: JoiCommon.string.email.required()
                })
            }),

            logout: JoiCommon.object.request.keys({
                body: Joi.object({
                    email: JoiCommon.string.email.required()
                })
            }),

            googleRedirect: JoiCommon.object.request.keys({
                query: Joi.object({
                    code: Joi.string().required()
                })
            })
        },
        response: {
            register: Joi.object()
        }
    }

    constructor() {
        super()
    }

    private RegisterReqType: Joi.extractType<typeof AuthorizationController.schemas.request.register>
    private RegisterResType: Joi.extractType<typeof AuthorizationController.schemas.response.register>
    register(
        req: Request & typeof this.RegisterReqType,
        res: Response,
        next: NextFunction
    ): void | (Response & typeof this.RegisterResType) {
        try {

            return res.status(200).json({})
        } catch (err) {
            return next(err)
        }
    }

    google(
        req: Request & Joi.extractType<typeof AuthorizationController.schemas.request.register>,
        res: Response, next: NextFunction
    ) {
        try {

            return res.status(200).json({})
        } catch (err) {
            return next(err)
        }
    }

    googleRedirect(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            return res.status(200).json({ message: 'callback URI' })
        } catch (err) {
            return next(err)
        }
    }
}