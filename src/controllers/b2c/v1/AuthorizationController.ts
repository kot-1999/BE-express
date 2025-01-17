import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

import { EncryptionService } from '../../../services/Encryption'
import { JwtService } from '../../../services/Jwt'
import prisma from '../../../services/Prisma'
import { AbstractController } from '../../../types/AbstractController'
import { JoiCommon } from '../../../types/JoiCommon'
import { IError } from '../../../utils/IError'

export class AuthorizationController extends AbstractController {
    private static readonly userSchema = Joi.object({
        user: Joi.object({
            id: Joi.string().uuid()
                .required()
        }).required()
    })

    public static readonly schemas = {
        request: {
            register: JoiCommon.object.request.keys({
                body: Joi.object({
                    firstName: JoiCommon.string.name.required(),
                    lastName: JoiCommon.string.name.required(),
                    email: JoiCommon.string.email.required(),
                    password: Joi.string().min(3)
                        .required()
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
            register: AuthorizationController.userSchema.required(),
            login: AuthorizationController.userSchema.required()
        }
    }

    constructor() {
        super()
    }

    private RegisterReqType: Joi.extractType<typeof AuthorizationController.schemas.request.register>
    private RegisterResType: Joi.extractType<typeof AuthorizationController.schemas.response.register>
    async register(
        req: Request & typeof this.RegisterReqType,
        res: Response,
        next: NextFunction
    ): Promise<void | Response<typeof this.RegisterResType>> {
        try {
            const { body } = req
            let user = await prisma.user.findFirst({
                where: {
                    email: {
                        equals: body.email
                    }
                }
            })

            if (user) {
                throw new IError(409, 'User already exists. Try to login again, or use forgot password')
            }

            user = await prisma.user.create({
                data: {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    email: body.email,
                    emailVerified: false,
                    password: EncryptionService.hashSHA256(EncryptionService.decryptAES(body.password))
                }
            })
            req.session.jwt = JwtService.generateToken({
                id: user.id,
                aud: 'b2c'
            })
            return res
                .status(200)
                .json({
                    user: {
                        id: user.id
                    }
                })
        } catch (err) {
            return next(err)
        }
    }

    private LoginReqType: Joi.extractType<typeof AuthorizationController.schemas.request.login>
    private LoginResType: Joi.extractType<typeof AuthorizationController.schemas.response.login>
    async login(
        req: Request & typeof this.LoginReqType,
        res: Response,
        next: NextFunction
    ): Promise<void | Response<typeof this.LoginResType>> {
        try {
            const { body } = req
            // Find user
            const user = await prisma.user.findFirst({
                where: {
                    email: {
                        equals: body.email
                    }
                }
            })

            if (!user) {
                throw new IError(401, 'Password or email is incorrect')
            }

            // Check password
            const decryptedPassword = EncryptionService.decryptAES(body.password)
            if (user.password !== EncryptionService.hashSHA256(decryptedPassword)) {
                throw new IError(401, 'Password or email is incorrect')
            }

            req.session.jwt = JwtService.generateToken({
                id: user.id,
                aud: 'b2c'
            })

            return res
                .status(200)
                .json({
                    user: {
                        id: user.id
                    }
                })
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

    logout(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            req.logout((error) => {
                if (error) {
                    throw new IError(500, 'Failed to log out')
                }
                req.session?.destroy((error: Error) => {
                    if (error) {
                        throw new IError(500, 'Failed to destroy session')
                    }
                })
            })

            res
                .clearCookie('connect.sid')
                .status(200)
                .json({
                    message: 'User was logged out'
                })
        } catch (err) {
            return next(err)
        }
    }
}