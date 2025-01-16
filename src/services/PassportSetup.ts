import { User } from '@prisma/client'
import config from 'config'
import { JwtPayload } from 'jsonwebtoken'
import passport from 'passport'
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'

import prisma from './Prisma'
import { IConfig } from '../types/config'
import { PassportStrategy } from '../utils/enums'
import { IError } from '../utils/IError'

const googleStrategyConfig = config.get<IConfig['googleStrategy']>('googleStrategy')
const jwtConfig = config.get<IConfig['jwt']>('jwt')
const passportConfig = config.get<IConfig['passport']>('passport')

class PassportSetup {
    /**
     * - Save user to DB if such doesn't exist
     * - Update user's googleProfileID if such doesn't exist
     * */
    private async googleStrategy(
        accessToken: string,
        refreshToken: string, 
        profile: Profile,
        done: VerifyCallback
    ): Promise<void> {
        try {
            if (!profile.emails?.length) {
                throw new IError(401, 'No email provided by google response')
            }
            let user = await prisma.user.findFirst({
                where: {
                    OR: [{
                        email: {
                            equals: profile.emails[0].value
                        }
                    },
                    {
                        googleProfileID: profile.id
                    }]
                }
            })

            if (user) {
                if (!user.googleProfileID) {
                    await prisma.user.update({
                        where: {
                            id: user.id
                        },
                        data: {
                            googleProfileID: profile.id
                        }
                    })
                }
            } else {
                user = await prisma.user.create({
                    data: {
                        googleProfileID: profile.id,
                        firstName: profile.name?.givenName ?? null,
                        lastName: profile.name?.familyName ?? null,
                        email: profile.emails[0].value,
                        emailVerified: profile.emails?.length ? profile.emails[0].verified : false
                    }
                })
            }

            if (!user) {
                throw new IError(401, 'Not authorized (googleStrategy)')
            }

            done(null, user)
        } catch (err) {
            done(err, false)
        }
    }

    private async b2cJwtStrategy(payload: JwtPayload, done: VerifyCallback) {
        try {
            if (payload.aud !== 'b2c') {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }

            const user = await prisma.user.findFirst({
                where: {
                    id: payload.id
                }
            })

            if (!user) {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }
            return done(null, user)
        } catch (err) {
            done(err, false)
        }
    }

    private serializeUser(user: User, done: (err: Error | null, id: string | null) => void): void {
        const err = !user?.id ? new IError(401, 'Authorization id is missing') : null
        done(err, user.id)
    }

    private async deserializeUser(id: string, done: (err: Error | null, user: User | null) => void): Promise<void> {
        const user = await prisma.user.findFirst({
            where: {
                id: {
                    equals: id
                }
            }
        })
        const err = user ? null : new IError(401, 'User wasn\'t deserialized')
        done(err, user)
    }
    
    constructor() {
        passport.use(PassportStrategy.google, new GoogleStrategy(
            {
                clientID: googleStrategyConfig.clientID,
                clientSecret: googleStrategyConfig.clientSecret,
                callbackURL: googleStrategyConfig.callbackURL
            },
            this.googleStrategy
        ))

        passport.use(PassportStrategy.jwtB2c, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([passportConfig.jwtFromRequest]),
                secretOrKey: jwtConfig.secret
            }, 
            this.b2cJwtStrategy
        ))

        passport.serializeUser(this.serializeUser)
        passport.deserializeUser(this.deserializeUser)
    }
}

const passportSetup = new PassportSetup()
export default passportSetup