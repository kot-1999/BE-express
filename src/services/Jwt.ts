import config from 'config'
import jwt, { JwtPayload } from 'jsonwebtoken'

import { EncryptionService } from './Encryption'
import { IConfig } from '../types/config'

const jwtConfig = config.get<IConfig['jwt']>('jwt')

interface IJwtPayload extends JwtPayload {
    id: string
}

export class JwtService {
    
    public static generateToken(payload: IJwtPayload) {
        const token =  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
        return EncryptionService.encryptAES(token)
    }
    
    public static verifyToken(token: string): string | IJwtPayload  {
        const decryptedToken = EncryptionService.decryptAES(token)
        return jwt.verify(decryptedToken, jwtConfig.secret) as IJwtPayload | string
    }
}