import 'dotenv/config'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../src/types/config'

export default <IConfig>{
    app: {
        port: process.env.PORT
    },
    cookieSession: {
        name: 'session',
        maxAge: 60 * 60 * 1000, // 1 hour
        keys: [process.env.COOKIE_SECRET_KEY]
    },
    database: {
        postgresURL: process.env.POSTGRES_URL
    },
    googleStrategy: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/b2c/v1/authorization/google/redirect'
    },
    passport: {
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => {
                return req?.session?.jwt ?? null // Extract JWT from cookies
            }
        ]),
        secretOrKey: process.env.COOKIE_SECRET_KEY // Replace with a secure key
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },
    encryption: {
        key: process.env.ENCRYPTION_KEY
    }
}
