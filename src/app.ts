import cookieParser from 'cookie-parser'
import express from 'express'

import '@goodrequest/joi-type-extract'
import errorMiddleware from './middlewares/errorMiddleware'
import authorizeRouters from './routes'

// Initialize services
import './services/PassportSetup'
import './services/Prisma'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// app.use('/api', api())
app.use('/api', authorizeRouters())
app.use(errorMiddleware)

export default app