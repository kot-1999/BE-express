import { Router } from 'express'

import authorizationRouter from './b2c/AuthorizationRouter'
import userRouter from './b2c/UserRouter'

const router = Router()

export default function authorizeRouters() {
    // eslint-disable-next-line no-console
    console.log('Routes are initialized'.green)
    
    // B2C
    router.use('/b2c/v1/authorization',authorizationRouter())
    router.use('/b2c/v1/user', userRouter())

    return router
}