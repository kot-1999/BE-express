import { Router } from 'express'

import authorizationRouter from './b2c/AuthorizationRouter'
import userRouter from './b2c/UserRouter'
import logger from '../services/Logger';

const router = Router()

export default function authorizeRouters() {
    logger.info('Application routes were initialized.')
    
    // B2C
    router.use('/b2c/v1/authorization',authorizationRouter())
    router.use('/b2c/v1/user', userRouter())

    return router
}