// Init router and controller
import express from 'express'

import { AdminController } from '../../controllers/b2b/v1/admin/AdminController'
import authorizationMiddleware from '../../middlewares/authorizationMiddleware'
import validationMiddleware from '../../middlewares/validationMiddleware'
import { PassportStrategy } from '../../utils/enums'

const router = express.Router()
const adminController = new AdminController()

export default function adminRouter() {
    router.get(
        /*
            #swagger.tags = ['b2b-v1-Admin']
            #swagger.description = 'Get admin details',
            #swagger.parameters['body'] = {
                in: 'body',
                description: 'Add new admin.',
                schema: { $ref: '#/definitions/b2bV1GetAdminReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2bV1GetAdminRes" },
            }
        */
        '/:adminID',
        validationMiddleware(AdminController.schemas.request.getAdmin),
        authorizationMiddleware([PassportStrategy.jwtB2b]),
        adminController.getAdmin
    )

    router.delete(
        /*
            #swagger.tags = ['b2b-v1-Admin']
            #swagger.description = 'Delete admin. Admin can delete only himself.',
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2cV1DeleteUserReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2cV1DeleteUserRes" },
            }
        */
        '/:adminID',
        validationMiddleware(AdminController.schemas.request.deleteAdmin),
        authorizationMiddleware([PassportStrategy.jwtB2b]),
        adminController.deleteAdmin
    )

    return router
}