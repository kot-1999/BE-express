import { Router } from 'express'

import adminAuthorizationRouter from './b2b/AdminAuthorizationRouter'
import adminRouter from './b2b/AdminRouter'
import userAuthorizationRouter from './b2c/UserAuthorizationRouter'
import userRouter from './b2c/UserRouter'
import { FileUpload } from '../controllers/FileUpload';
import authorizationMiddleware from '../middlewares/authorizationMiddleware';
import validationMiddleware from '../middlewares/validationMiddleware';
import logger from '../services/Logger'
import { PassportStrategy } from '../utils/enums';

const fileUpload = new FileUpload()

const router = Router()

export default function authorizeRouters() {
    logger.info('Application routes were initialized.')
    // B2B
    router.use('/b2b/v1/authorization', adminAuthorizationRouter())
    router.use('/b2b/v1/admin', adminRouter())

    // B2C
    router.use('/b2c/v1/authorization',userAuthorizationRouter())
    router.use('/b2c/v1/user', userRouter())

    // Other
    router.put(
        /*
            #swagger.tags = ['File-Upload']
            #swagger.description = 'Upload a file.',
            #swagger.security = [{
                "bearerAuth": []
            }]
            #swagger.parameters['body'] = {
                in: 'body',
                schema: { $ref: '#/definitions/b2bV1PutFileReqBody' }
            }
            #swagger.responses[200] = {
                schema: { "$ref": "#/definitions/b2bV1PutFileRes" },
            }
        */
        '/upload-url',
        validationMiddleware(FileUpload.schemas.request.putFile),
        authorizationMiddleware([PassportStrategy.jwtB2b, PassportStrategy.jwtB2c, PassportStrategy.google]),
        fileUpload.putFile
    )

    return router
}