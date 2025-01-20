import { Request, Response, NextFunction, AuthUserRequest } from 'express'
import Joi from 'joi'

import emailService from '../../../services/Email'
import { EncryptionService } from '../../../services/Encryption'
import { JwtService } from '../../../services/Jwt'
import prisma from '../../../services/Prisma'
import { AbstractController } from '../../../types/AbstractController'
import { JoiCommon } from '../../../types/JoiCommon'
import { EmailType } from '../../../utils/enums'
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
                }).required()
            }),

            logout: JoiCommon
        },
        response: {
            register: AuthorizationController.userSchema.required(),
            login: AuthorizationController.userSchema.required(),
            logout: AuthorizationController.userSchema.keys({
                message: Joi.string().required()
            }).required(),
            forgotPassword: Joi.object({
                message: Joi.string().required()
            }).required()
        }
    }

    constructor() {
        super()
    }

    private RegisterReqType: Joi.extractType<typeof AuthorizationController.schemas.request.register>
    private RegisterResType: Joi.extractType<typeof AuthorizationController.schemas.response.register>
    public async register(
        req: Request & typeof this.RegisterReqType,
        res: Response<typeof this.RegisterResType>,
        next: NextFunction
    ) {
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
    public async login(
        req: Request & typeof this.LoginReqType,
        res: Response<typeof this.LoginResType>,
        next: NextFunction
    ) {
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

    public googleRedirect(
        req: Request,
        res: Response,
        next: NextFunction
    ): void | Response {
        try {
            return res.status(200).json({ message: 'callback URI' })
        } catch (err) {
            return next(err)
        }
    }

    private LogoutResType: Joi.extractType<typeof AuthorizationController.schemas.response.logout>
    public async logout(
        req: AuthUserRequest,
        res: Response<typeof this.LogoutResType>,
        next: NextFunction
    ) {
        try {
            const userID = req.user.id
            // Wrap req.logout() in a Promise
            await new Promise<void>((resolve) => {
                req.logout((err) => {
                    if (err) {
                        throw err
                    }
                    resolve()
                })
            })

            // Destroy the session after logout
            await new Promise<void>((resolve) => {
                req.session.destroy((err) => {
                    if (err) {
                        throw err
                    }
                    resolve()
                })
            })
            res
                .clearCookie('connect.sid')
                .status(200)
                .json({
                    user: {
                        id: userID
                    },
                    message: 'User was logged out'
                })
        } catch (err) {
            return next(err)
        }
    }

    private ForgotPasswordReqType: Joi.extractType<typeof AuthorizationController.schemas.request.forgotPassword>
    private ForgotPasswordResType: Joi.extractType<typeof AuthorizationController.schemas.response.forgotPassword>
    public async forgotPassword(
        req: Request & typeof this.ForgotPasswordReqType,
        res: Response<typeof this.ForgotPasswordResType>,
        next: NextFunction
    ) {
        try {
            const { body: { email } } = req

            const user = await prisma.user.findFirst({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                },
                where: {
                    email: {
                        equals: email
                    }
                }
            })

            if (user) {
                emailService.sendEmail(EmailType.forgotPassword, {
                    ...user
                })
            }

            res.status(200).json({
                message: 'Email with password recovery link was successfully sent'
            })
        } catch (err) {
            return next(err)
        }
    }
}