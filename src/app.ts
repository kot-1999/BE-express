import config from 'config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'

// Internal imports
import errorMiddleware from './middlewares/errorMiddleware' // eslint-disable-next-line import/order
import authorizeRouters from './routes'

// Initialize services
import './services/PassportSetup'
import './services/Prisma'

import { IConfig } from './types/config'

const cookieSessionConfig = config.get<IConfig['cookieSession']>('cookieSession')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: cookieSessionConfig.keys,
    resave: false,
    saveUninitialized: false,
    name: cookieSessionConfig.name,
    cookie: {
        maxAge: cookieSessionConfig.maxAge,
        secure: cookieSessionConfig.secure
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api', authorizeRouters())
app.use(errorMiddleware)
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the BE-Proj-01')
})
export default app