import { AdminRole } from '@prisma/client'
import { Response, NextFunction, AuthAdminRequest } from 'express'
import Joi from 'joi'

import prisma from '../../../../services/Prisma'
import { AbstractController } from '../../../../types/AbstractController'
import { JoiCommon } from '../../../../types/JoiCommon'
import { IError } from '../../../../utils/IError'

export class AdminController extends AbstractController {
    private static readonly adminSchema = Joi.object({
        id: JoiCommon.string.id,
        firstName: JoiCommon.string.name.allow(null),
        lastName: JoiCommon.string.name.allow(null),
        email: JoiCommon.string.email,
        emailVerified: Joi.boolean().required(),
        role: Joi.string().valid(...Object.values(AdminRole))
            .required(),
        createdAt: Joi.date().iso()
            .required(),
        updatedAt: Joi.date().iso()
            .allow(null)
            .required()
    })
    public static readonly schemas = {
        request: {
            getAdmin: JoiCommon.object.request.keys({
                params: Joi.object({
                    adminID: JoiCommon.string.id
                }).required()
            }).required(),

            deleteAdmin: JoiCommon.object.request.required()
        },
        response: {
            getAdmin: Joi.object({
                admin: this.adminSchema.required()
            }),

            deleteAdmin: Joi.object({
                admin: Joi.object({
                    id: JoiCommon.string.id
                }),
                message: Joi.string().required()
            }).required()
        }
    }

    constructor() {
        super()
    }

    private GetAdminReqType: Joi.extractType<typeof AdminController.schemas.request.getAdmin>
    private GetAdminResType: Joi.extractType<typeof AdminController.schemas.response.getAdmin>
    async getAdmin(
        req: AuthAdminRequest & typeof this.GetAdminReqType,
        res: Response<typeof this.GetAdminResType>,
        next: NextFunction
    ) {
        try {
            let resultAdmin: typeof this.GetAdminResType['admin'] | null = null
            const { admin, params: { adminID } } = req
            if (admin.id === adminID) {
                resultAdmin = {
                    id: admin.id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    emailVerified: admin.emailVerified,
                    role: admin.role,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt
                }
            } else {
                resultAdmin = await prisma.admin.findOne({
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
                        equals: adminID
                    }
                })
            }

            if (!resultAdmin) {
                throw new IError(404, 'Admin was not found')
            }

            return res.status(200).json({ admin: resultAdmin })
        } catch (err) {
            return next(err)
        }
    }

    private DeleteAdminReqType: Joi.extractType<typeof AdminController.schemas.request.deleteAdmin>
    private DeleteAdminResType: Joi.extractType<typeof AdminController.schemas.response.deleteAdmin>
    public async deleteAdmin(
        req: AuthAdminRequest & typeof this.DeleteAdminReqType,
        res: Response<typeof this.DeleteAdminResType>,
        next: NextFunction
    ) {
        try {
            const { admin } = req

            await prisma.admin.softDelete(admin.id)

            return res.status(200).json({
                admin: {
                    id: admin.id
                },
                message: 'Admin was deleted successfully.'
            })
        } catch (err) {
            return next(err)
        }
    }
}