import * as fs from 'node:fs'
import * as path from 'node:path'

import config from 'config'
import { RedisStore as RedisSessionStore } from 'connect-redis'
import express from 'express'
import rateLimit from 'express-rate-limit';
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'
import { RedisStore as RedisRateLimitStore } from 'rate-limit-redis'
import swaggerUi from 'swagger-ui-express'

import errorMiddleware from './middlewares/errorMiddleware' // eslint-disable-next-line import/order
import authorizeRouters from './routes'

// Initialize services
import './services/Passport'
import './services/Prisma'

import logger from './services/Logger'
import redis from './services/Redis'
import { IConfig } from './types/config'
import { NodeEnv } from './utils/enums';

// Configs
const cookieSessionConfig = config.get<IConfig['cookieSession']>('cookieSession')
const helmetConfig = config.get<IConfig['helmet']>('helmet')
const appConfig = config.get<IConfig['app']>('app')

// Local variables
const app = express()
const redisClient = redis.getRedisClient()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create and use security policy middleware
app.use(helmet.contentSecurityPolicy(helmetConfig.contentSecurity))

// Create and use the rate limiter
if (appConfig.env !== NodeEnv.Test) {
    app.use(rateLimit({
    // Rate limiter configuration
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers

        // Redis store configuration
        store: new RedisRateLimitStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args)
        }),
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
            res.status(429).json({ error: 'Too many requests' });
        }
    }))
}

// Create and express-session middleware
app.use(session({
    secret: cookieSessionConfig.secret,
    resave: cookieSessionConfig.resave,
    store: new RedisSessionStore({
        client: redisClient,
        prefix: 'app_session: '
    }),
    saveUninitialized: cookieSessionConfig.saveUninitialized,
    name: cookieSessionConfig.name,
    cookie: {
        maxAge: cookieSessionConfig.cookie.maxAge,
        secure: cookieSessionConfig.cookie.secure,
        httpOnly: cookieSessionConfig.cookie.httpOnly
    }
}))

// Initialize passport and passport-session (express-session should be initialized before).
app.use(passport.initialize())
app.use(passport.session())

// Routes initialization
app.use('/api', authorizeRouters())
app.get('/api/test/sentry', (req, res) => {
    res.status(200).json({ message: 'done' })
})

const apiDocPath = path.join(__dirname, '../dist/apiDoc/swaggerApi.json')
if (fs.existsSync(apiDocPath)) {
    const swaggerDocument = JSON.parse(fs.readFileSync(apiDocPath, 'utf-8'))

    // Serve Swagger UI at /api/docs
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

// The error handler must be registered before any other error middleware and after all controllers

// Error middleware initialization.
// NOTE: Should be defined as the last middleware to prevent
// losing information about bugs and errors
app.use(errorMiddleware)

// Default route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the BE-Proj-01')
})

export default app