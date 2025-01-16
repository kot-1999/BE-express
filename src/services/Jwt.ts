import config from 'config'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { IConfig } from '../types/config'

const jwtConfig = config.get<IConfig['jwt']>('jwt')

export class JwtService {

    public static generateToken(payload: {
        id: string,
        aud: 'b2c' | 'b2b' | 'fps',
    }) {
        const token =  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
        // return EncryptionService.encryptAES(token)
        return token
    }
    
    public static verifyToken(token: string): string | JwtPayload  {
        // const decryptedToken = EncryptionService.decryptAES(token)
        return jwt.verify(token, jwtConfig.secret) as JwtPayload | string
    }
}