import { Admin, User } from '@prisma/client'
import config from 'config'
import { JwtPayload } from 'jsonwebtoken'
import passport from 'passport'
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'

import logger from './Logger';
import prisma from './Prisma'
import { IConfig } from '../types/config'
import { JwtAudience, PassportStrategy } from '../utils/enums'
import { IError } from '../utils/IError'

/**
 * @class PassportSetup
 * @description Configures and initializes Passport strategies for authentication.
 * Supports Google OAuth, multiple JWT strategies (B2C, B2B, forgot password, invites),
 * and session serialization/deserialization.
 *
 * @param {IConfig['googleStrategy']} googleStrategyConfig - Google OAuth configuration
 * @param {IConfig['jwt']} jwtConfig - JWT configuration (secret, algorithm, etc.)
 * @param {IConfig['passport']} passportConfig - Passport-related configuration (extractors, etc.)
 *
 * @method googleStrategy Handles Google OAuth authentication
 * @method b2cJwtStrategy Handles JWT authentication for users (B2C)
 * @method b2cJwtForgotPasswordStrategy Handles JWT for B2C password reset
 * @method b2bJwtStrategy Handles JWT authentication for admins (B2B)
 * @method b2bJwtForgotPasswordStrategy Handles JWT for B2B password reset
 * @method inviteEmployee Handles JWT for employee invitation flow
 * @method serializeUser Serializes user/admin into session
 * @method deserializeUser Deserializes user/admin from session
 */
class PassportSetup {
    private googleStrategyConfig: IConfig['googleStrategy']
    private jwtConfig: IConfig['jwt']
    private passportConfig: IConfig['passport']

    /**
     * @constructor
     * @param {IConfig['googleStrategy']} googleStrategyConfig
     * @param {IConfig['jwt']} jwtConfig
     * @param {IConfig['passport']} passportConfig
     */
    constructor(
        googleStrategyConfig: IConfig['googleStrategy'],
        jwtConfig: IConfig['jwt'],
        passportConfig: IConfig['passport']
    ) {
        this.googleStrategyConfig = googleStrategyConfig
        this.jwtConfig = jwtConfig
        this.passportConfig = passportConfig

        if (this.googleStrategyConfig) {
            passport.use(PassportStrategy.google, new GoogleStrategy(
                {
                    clientID: this.googleStrategyConfig.clientID,
                    clientSecret: this.googleStrategyConfig.clientSecret,
                    callbackURL: this.googleStrategyConfig.callbackURL
                },
                this.googleStrategy
            ))
        } else {
            logger.warn('Google strategy config not provided')
        }

        passport.use(PassportStrategy.jwtB2c, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    this.passportConfig.jwtFromCookie,
                    this.passportConfig.jwtFromRequestHeader
                ]),
                secretOrKey: this.jwtConfig.secret
            },
            this.b2cJwtStrategy
        ))

        passport.use(PassportStrategy.jwtB2cForgotPassword, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([this.passportConfig.jwtFromRequestHeader]),
                secretOrKey: this.jwtConfig.secret
            },
            this.b2cJwtForgotPasswordStrategy
        ))

        passport.use(PassportStrategy.jwtB2b, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([this.passportConfig.jwtFromRequestHeader, this.passportConfig.jwtFromCookie]),
                secretOrKey: this.jwtConfig.secret
            },
            this.b2bJwtStrategy
        ))

        passport.use(PassportStrategy.jwtB2bForgotPassword, new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([this.passportConfig.jwtFromRequestHeader, this.passportConfig.jwtFromCookie]),
                secretOrKey: this.jwtConfig.secret
            },
            this.b2bJwtForgotPasswordStrategy
        ))

        passport.serializeUser(this.serializeUser)
        passport.deserializeUser(this.deserializeUser)
    }

    /**
     * @method googleStrategy
     * @description Handles Google OAuth authentication:
     * - Finds or creates user in database
     * - Updates googleProfileID if missing
     *
     * @param {string} accessToken
     * @param {string} refreshToken
     * @param {Profile} profile - Google profile data
     * @param {VerifyCallback} done - Passport callback
     *
     * @returns {Promise<void>}
     */
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
                        email: profile.emails[0].value,
                        deletedAt: null
                    },
                    {
                        googleProfileID: profile.id,
                        deletedAt: null
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

            return done(null, user)
        } catch {
            return done(null, false)
        }
    }

    /**
     * @method b2cJwtForgotPasswordStrategy
     * @description Validates JWT for B2C password reset flow
     */
    private async b2cJwtStrategy(payload: JwtPayload, done: VerifyCallback) {
        try {
            if (payload.aud !== JwtAudience.b2c) {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }

            const user = await prisma.user.findFirst({
                where: {
                    id: payload.id,
                    deletedAt: null
                }
            })

            if (!user) {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }
            return done(null, user)
        } catch {
            return done(null, false)
        }
    }

    /**
     * @method b2bJwtForgotPasswordStrategy
     * @description Validates JWT for B2B password reset flow
     */
    private async b2cJwtForgotPasswordStrategy(payload: JwtPayload, done: VerifyCallback) {
        try {
            if (payload.aud !== JwtAudience.b2cForgotPassword) {
                throw new IError(401, 'Not authorized (JwtForgotPasswordStrategy)')
            }

            const user = await prisma.user.findFirst({
                where: {
                    id: payload.id,
                    deletedAt: null
                }
            })

            if (!user) {
                throw new IError(401, 'Not authorized (JwtForgotPasswordStrategy)')
            }
            return done(null, user)
        } catch {
            return done(null, false)
        }
    }

    /**
     * @method b2bJwtStrategy
     * @description Validates JWT for admin (B2B) authentication
     */
    private async b2bJwtStrategy(payload: JwtPayload, done: VerifyCallback) {
        try {
            if (payload.aud !== JwtAudience.b2b) {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }

            const admin = await prisma.admin.findFirst({
                where: {
                    id: payload.id,
                    deletedAt: null
                }
            })

            if (!admin) {
                throw new IError(401, 'Not authorized (JwtStrategy)')
            }
            return done(null, admin)
        } catch {
            return done(null, false)
        }
    }

    /**
     * @method b2bJwtForgotPasswordStrategy
     * @description Validates JWT for B2B password reset flow
     */
    private async b2bJwtForgotPasswordStrategy(payload: JwtPayload, done: VerifyCallback) {
        try {
            if (payload.aud !== JwtAudience.b2bForgotPassword) {
                throw new IError(401, 'Not authorized (JwtForgotPasswordStrategy)')
            }

            const admin = await prisma.admin.findFirst({
                where: {
                    id: payload.id,
                    deletedAt: null
                }
            })

            if (!admin) {
                throw new IError(401, 'Not authorized (JwtForgotPasswordStrategy)')
            }
            return done(null, admin)
        } catch {
            return done(null, false)
        }
    }

    /**
     * @method serializeUser
     * @description Serializes user/admin into session
     */
    private serializeUser(
        user: User | Admin,
        done: (
            err: Error | null,
            entity: { id: string | null, type: 'user' | 'admin' }
        ) => void
    ): void {
        const err = !user?.id ? new IError(401, 'Authorization id is missing') : null
        done(err, {
            id: user.id,
            type: 'role' in user ? 'admin' : 'user'
        })
    }

    /**
     * @method deserializeUser
     * @description Deserializes session entity back into user/admin
     */
    private async deserializeUser(
        entity: { id: string, type: 'user' | 'admin' },
        done: (err: Error | null, user: User | Admin | null) => void
    ): Promise<void> {
        const user = entity.type === 'user'
            ? await prisma.user.findFirst({ where: { id: entity.id } })
            : await prisma.admin.findFirst({ where: { id: entity.id } })
        const err = user ? null : new IError(401, 'User wasn\'t deserialized')
        done(err, user)
    }
}

const googleStrategyConfig = config.get<IConfig['googleStrategy']>('googleStrategy')
const jwtConfig = config.get<IConfig['jwt']>('jwt')
const passportConfig = config.get<IConfig['passport']>('passport')

const passportSetup = new PassportSetup(
    googleStrategyConfig,
    jwtConfig,
    passportConfig
)

export default passportSetup