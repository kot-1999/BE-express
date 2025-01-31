import config from 'config'
import { RedisStore } from 'connect-redis'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'

// Internal imports
import errorMiddleware from './middlewares/errorMiddleware' // eslint-disable-next-line import/order
import authorizeRouters from './routes'

// Initialize services
import './services/PassportSetup'
import './services/Prisma'

import redis from './services/Redis'
import { IConfig } from './types/config'

const cookieSessionConfig = config.get<IConfig['cookieSession']>('cookieSession')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'apis.google.com'], // Allow Google OAuth
        styleSrc: ["'self'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'lh3.googleusercontent.com']
    }
}))

const redisStore = new RedisStore({
    client: redis.getRedisClient(),
    prefix: 'app_session: '
})

app.use(session({
    secret: cookieSessionConfig.secret,
    resave: cookieSessionConfig.resave,
    store: redisStore,
    saveUninitialized: cookieSessionConfig.saveUninitialized,
    name: cookieSessionConfig.name,
    cookie: {
        maxAge: cookieSessionConfig.cookie.maxAge,
        secure: cookieSessionConfig.cookie.secure,
        httpOnly: cookieSessionConfig.cookie.httpOnly
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