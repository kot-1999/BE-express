import 'dotenv/config'
import { Request } from 'express'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../src/types/config'

export default <IConfig>{
    app: {
        port: process.env.PORT
    },
    database: {
        postgresURL: process.env.POSTGRES_URL
    },
    passport: {
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req: Request) => {
                return req?.cookies?.jwt // Extract JWT from cookies
            }
        ]),
        secretOrKey: 'your_jwt_secret' // Replace with a secure key
    },
    googleStrategy: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/b2c/v1/authorization/google/redirect'
    }
}
