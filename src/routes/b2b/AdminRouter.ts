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
        '/:adminID',
        validationMiddleware(AdminController.schemas.request.getAdmin),
        authorizationMiddleware([PassportStrategy.jwtB2b]),
        adminController.getAdmin
    )

    router.delete(
        '/:adminID',
        validationMiddleware(AdminController.schemas.request.deleteAdmin),
        authorizationMiddleware([PassportStrategy.jwtB2b]),
        adminController.deleteAdmin
    )

    return router
}