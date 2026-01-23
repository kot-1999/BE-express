import config from 'config'
import { Request } from 'express'
import jwt, { JwtPayload }from 'jsonwebtoken'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../types/config'

const jwtConfig = config.get<IConfig['jwt']>('jwt')

export class JwtService {

    public static generateToken(payload: JwtPayload): string {
        const token =  jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            algorithm: jwtConfig.algorithm 
        })
        // return EncryptionService.encryptAES(token)
        return token
    }
    
    public static verifyToken(token: string): string | JwtPayload  {
        // const decryptedToken = EncryptionService.decryptAES(token)
        return jwt.verify(token, jwtConfig.secret) as JwtPayload | string
    }

    public static jwtExtractor = ExtractJwt.fromExtractors([
        (req: Request) => {
            return req?.session?.jwt ?? null // Extract JWT from cookies
        }
    ])
    
}