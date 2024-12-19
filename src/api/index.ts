import { Router } from 'express'

import testRouter from './test'

const router = Router()

export default () => {
    router.use('/test', testRouter())

    return router
}
