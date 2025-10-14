import { Router } from 'express'

import adminAuthorizationRouter from './b2b/AdminAuthorizationRouter'
import userAuthorizationRouter from './b2c/UserAuthorizationRouter'
import userRouter from './b2c/UserRouter'
import logger from '../services/Logger';

const router = Router()

export default function authorizeRouters() {
    logger.info('Application routes were initialized.')
    // B2B
    router.use('/b2b/v1/authorization', adminAuthorizationRouter())

    // B2C
    router.use('/b2c/v1/authorization',userAuthorizationRouter())
    router.use('/b2c/v1/user', userRouter())

    return router
}