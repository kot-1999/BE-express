import { UserRole } from '@prisma/client'
import { Response, NextFunction, AuthUserRequest } from 'express'
import Joi from 'joi'

import prisma from '../../../../services/Prisma'
import { AbstractController } from '../../../../types/AbstractController'
import { JoiCommon } from '../../../../types/JoiCommon'
import { IError } from '../../../../utils/IError'

export class UsersController extends AbstractController {
    private static readonly userSchema = Joi.object({
        id: Joi.string().required(),
        firstName: JoiCommon.string.name.allow(null),
        lastName: JoiCommon.string.name.allow(null),
        email: JoiCommon.string.email,
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
            }),

            deleteUser: JoiCommon.object.request.required()
        },
        response: {
            getUser: Joi.object({
                user: this.userSchema.required()
            }),

            getUsers: Joi.object({
                users: Joi.array().items(this.userSchema.required())
                    .required(),
                pagination: Joi.object({
                    page: Joi.number().required(),
                    limit: Joi.number().required(),
                    totalCount: Joi.number().required()
                })
            }),

            deleteUser: Joi.object({
                user: Joi.object({
                    id: Joi.string().required()
                }),
                message: Joi.string().required()
            }).required()
        }
    }

    constructor() {
        super()
    }

    private GetUserReqType: Joi.extractType<typeof UsersController.schemas.request.getUser>
    private GetUserResType: Joi.extractType<typeof UsersController.schemas.response.getUser>
    async getUser(
        req: AuthUserRequest & typeof this.GetUserReqType,
        res: Response<typeof this.GetUserResType>,
        next: NextFunction
    ) {
        try {
            let resultUser: typeof this.GetUserResType['user'] | null = null
            const { user, params: { userID } } = req
            if (user.id === userID) {
                resultUser = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            } else {
                resultUser = await prisma.user.findOne({
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    emailVerified: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }, {
                    id: {
                        equals: userID
                    }
                })
            }
            
            if (!resultUser) {
                throw new IError(404, 'User was not found')
            }

            return res.status(200).json({ user: resultUser })
        } catch (err) {
            return next(err)
        }
    }
    
    private GetUsersReqType: Joi.extractType<typeof UsersController.schemas.request.getUsers>
    private GetUsersResType: Joi.extractType<typeof UsersController.schemas.response.getUsers>
    async getUsers(
        req: AuthUserRequest & typeof this.GetUsersReqType,
        res: Response<typeof this.GetUsersResType>,
        next: NextFunction
    ) {
        try {

            return res.status(200).json({
                users: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    totalCount: 0
                }
            })
        } catch (err) {
            return next(err)
        }
    }

    private DeleteUserReqType: Joi.extractType<typeof UsersController.schemas.request.deleteUser>
    private DeleteUserResType: Joi.extractType<typeof UsersController.schemas.response.deleteUser>
    public async deleteUser(
        req: AuthUserRequest & typeof this.DeleteUserReqType,
        res: Response<typeof this.DeleteUserResType>,
        next: NextFunction
    ) {
        try {
            const { user } = req

            await prisma.user.softDelete(user.id)

            return res.status(200).json({
                user: {
                    id: user.id
                },
                message: 'User was deleted successfully.'
            })
        } catch (err) {
            return next(err)
        }
    }
}