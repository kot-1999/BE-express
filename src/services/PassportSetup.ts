import { User } from '@prisma/client'
import config from 'config'
import passport from 'passport'
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20'

import prisma from './Prisma'
import { IConfig } from '../types/config'
import { IError } from '../utils/IError'

const googleStrategyConfig = config.get<IConfig['googleStrategy']>('googleStrategy')

class PassportSetup {
    /**
     * - Save user to DB if such doesn't exist
     * - Update user's googleProfileID if such doesn't exist
     * */
    private async googleCallback(
        accessToken: string, refreshToken: string, 
        profile: Profile, done: VerifyCallback
    ): Promise<void> {
        let user: User | null = null
        if (profile.emails?.length) {
            user = await prisma.user.findFirst({
                where: {
                    OR: [{
                        email: {
                            equals: profile.emails[0].value,
                            not: null
                        }
                    },
                    {
                        googleProfileID: profile.id
                    }]
                }
            })
        }

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
                    email: profile.emails?.length ? profile.emails[0].value : null,
                    emailVerified: profile.emails?.length ? profile.emails[0].verified : false
                }
            })
        }

        done(user ? null : new IError(401, 'Not authorized'), user)
    }
    
    constructor() {
        passport.use('google', new GoogleStrategy(
            {
                clientID: googleStrategyConfig.clientID,
                clientSecret: googleStrategyConfig.clientSecret,
                callbackURL: googleStrategyConfig.callbackURL
            },
            this.googleCallback
        ))

        passport.serializeUser((user: { id: string }, done) => {
            done(null, user.id)
        })
        passport.deserializeUser(async (id: string, done) => {
            const user = await prisma.user.findFirst({
                where: {
                    id: {
                        equals: id
                    }
                }
            })
            done(user ? new IError(401, 'User wasn\'t deserialized') : null, user)
        })
    }
}

const passportSetup = new PassportSetup()
export default passportSetup