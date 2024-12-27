import { User } from '@prisma/client'
import config from 'config'
import passport from 'passport'
import { Profile, Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { IConfig } from '../types/config'

import prisma from './Prisma'

const googleStrategyConfig = config.get<IConfig['googleStrategy']>('googleStrategy')

class PassportSetup {
    /**
     * - Save user to DB if such doesn't exist
     * - Update user's googleProfileID if such doesn't exist
     * */
    private async googleCallback(accessToken: string, refreshToken: string, profile: Profile) {
        let user: User | undefined
        if (profile.emails?.length) {
            await prisma.user.findFirst({
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
    }
}

const passportSetup = new PassportSetup()
export default passportSetup