import express from 'express'

import authorizationRouter from './b2c/AuthorizationRouter'

const b2cCommon = 'b2c'
// const b2bCommon = 'b2b'

export default function authorizeRouters() {
    const router = express.Router()
    
    // B2C
    router.use(authorizationRouter(b2cCommon))

    return router
}