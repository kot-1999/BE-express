import express from 'express'

import { AuthorizationController } from '../../controllers/b2c/v1/AuthorizationController'
import validationMiddleware from '../../middlewares/validationMiddleware'

export default function authorizationRouter(url: string) {
    // Init router and controller
    const router = express.Router()
    router.use(`/${url}/v1/authorization`, router)
    const authorizationController = new AuthorizationController()

    // List endpoints
    router.post(
        '/register',
        validationMiddleware(AuthorizationController.schemas.registerSchema),
        authorizationController.register
    )

    return router
}
