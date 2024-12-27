import { UserRole } from '@prisma/client'
import { Response, NextFunction, AuthUserRequest } from 'express'
import Joi from 'joi'

import prisma from '../../../services/Prisma'
import { AbstractController } from '../../../types/AbstractController'
import { JoiCommon } from '../../../types/JoiCommon'
import { IError } from '../../../utils/IError'

export class UsersController extends AbstractController {
    private static readonly userSchema = Joi.object({
        id: Joi.string().required(),
        firstName: JoiCommon.string.name.allow(null),
        lastName: JoiCommon.string.name.allow(null),
        email: JoiCommon.string.email.allow(null),
        emailVerified: Joi.boolean().required(),
        role: Joi.string().valid(...Object.values(UserRole))
            .required(),
        createdAt: Joi.date().iso()
            .required(),
        updatedAt: Joi.date().iso()
            .allow(null)
            .required()
    })
    public static readonly schemas = {
        request: {
            getUser: JoiCommon.object.request.keys({
                params: Joi.object({
                    userID: Joi.string().required()
                }).required()
            }).required(),

            getUsers: JoiCommon.object.request.keys({
                body: Joi.object({
                    email: JoiCommon.string.email.required(),
                    password: Joi.string().required()
                })
            })
        },
        response: {
            getUser: JoiCommon.object.response.keys({
                body: this.userSchema.required()
            }),
            getUsers: JoiCommon.object.response.keys({
                body: Joi.object({
                    users: Joi.array().items(this.userSchema.required())
                        .required(),
                    pagination: Joi.object({
                        page: Joi.number().required(),
                        limit: Joi.number().required(),
                        totalCount: Joi.number().required()
                    })
                })
            })
        }
    }

    constructor() {
        super()
    }

    private GetUserReqType: Joi.extractType<typeof UsersController.schemas.request.getUser>
    private GetUserResType: Joi.extractType<typeof UsersController.schemas.response.getUser>
    async getUser(
        req: AuthUserRequest & typeof this.GetUserReqType,
        res: Response,
        next: NextFunction
    ): Promise<void | (Response & typeof this.GetUserResType)> {
        try {
            let resultUser: typeof this.GetUserResType['body'] | null = null
            const { user, params: { userID } } = req
            if (user.id === userID) {
                resultUser = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    role: user.role,
                    createdAt: user.updatedAt,
                    updatedAt: user.createdAt
                }
            } else {
                resultUser = await prisma.user.findFirst({
                    where: {
                        id: {
                            equals: userID
                        }
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        emailVerified: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true
                    }
                })
            }
            
            if (!resultUser) {
                throw new IError(404, 'User was not found')
            }

            return res.status(200).json(resultUser)
        } catch (err) {
            return next(err)
        }
    }
    
    private GetUsersReqType: Joi.extractType<typeof UsersController.schemas.request.getUsers>
    private GetUsersResType: Joi.extractType<typeof UsersController.schemas.request.getUsers>
    async getUsers(
        req: AuthUserRequest & typeof this.GetUsersReqType,
        res: Response,
        next: NextFunction
    ): Promise<void | (Response & typeof this.GetUsersResType)> {
        try {

            return res.status(200).json({})
        } catch (err) {
            return next(err)
        }
    }
}