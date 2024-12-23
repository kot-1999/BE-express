import express from 'express'

import errorMiddleware from './middlewares/errorMiddleware'
import authorizeRouters from './routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use('/api', api())
app.use('/api', authorizeRouters())
app.use(errorMiddleware)

export default app