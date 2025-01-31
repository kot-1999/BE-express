import 'dotenv/config'

import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../src/types/config'
import { NodeEnv } from '../src/utils/enums'

const isProd = process.env.NODE_ENV === NodeEnv.Prod

const options: IConfig = {
    app: {
        port: process.env.PORT as string
    },
    cookieSession: {
        name: 'session',
        secret: [process.env.COOKIE_SECRET_KEY as string],
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: isProd,
            httpOnly: isProd
        }
    },
    database: {
        postgresURL: process.env.POSTGRES_URL as string
    },
    googleStrategy: {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: '/api/b2c/v1/authorization/google/redirect'
    },
    passport: {
        jwtFromCookie: ExtractJwt.fromExtractors([
            (req: Request) => {
                return req?.session?.jwt ?? null // Extract JWT from cookies
            }
        ]),
        jwtFromRequestHeader: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    jwt: {
        secret: process.env.JWT_SECRET  as string,
        expiresIn: process.env.JWT_EXPIRES_IN as string
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY as string
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_PASSWORD  as string,
            pass: process.env.EMAIL_PASSWORD as string
        },
        fromAddress: process.env.EMAIL_FROM_ADDRESS as string
    },
    redis: {
        name: 'redis_' + process.env.NODE_ENV,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USER,
        socket: {
            host: process.env.REDIS_HOST as string,
            port: Number(process.env.REDIS_PORT)
        }
    },
    helmet: {
        contentSecurity: {
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"], // Allow resources to be loaded
                scriptSrc: ["'self'", 'apis.google.com'], // Allows JavaScript to be loaded
                styleSrc: ["'self'", 'fonts.googleapis.com'], // Allows CSS stylesheets to be loaded
                fontSrc: ["'self'", 'fonts.gstatic.com'], // Allows font files to be loaded
                imgSrc: ["'self'", 'lh3.googleusercontent.com'] // Allows images to be loaded
            }
        }
    },
}
export default options