import config from 'config'
import { Request } from 'express'
import jwt, { JwtPayload }from 'jsonwebtoken'
import { ExtractJwt } from 'passport-jwt'

import { IConfig } from '../types/config'

const jwtConfig = config.get<IConfig['jwt']>('jwt')

/**
 * @class JwtService
 * @description Utility class for handling JSON Web Token (JWT) operations.
 * Provides methods for generating, verifying, and extracting JWTs.
 *
 * @method generateToken Creates a signed JWT token
 * @method verifyToken Verifies and decodes a JWT token
 * @property jwtExtractor Custom extractor for retrieving JWT from request
 */
export class JwtService {

    /**
     * @method generateToken
     * @description Generates a signed JWT token using provided payload and configuration
     *
     * @param {JwtPayload} payload - Data to include in the token
     * @param {number} [expiresIn] - Optional expiration time in seconds (overrides config)
     *
     * @returns {string} Signed JWT token
     */
    public static generateToken(payload: JwtPayload, expiresIn?: number): string {
        const token =  jwt.sign(payload, jwtConfig.secret, {
            expiresIn: expiresIn ?? jwtConfig.expiresIn,
            algorithm: jwtConfig.algorithm
        })
        // return EncryptionService.encryptAES(token)
        return token
    }

    /**
     * @method verifyToken
     * @description Verifies a JWT token and returns the decoded payload
     *
     * @param {string} token - JWT token to verify
     * @returns {string | JwtPayload} Decoded token payload
     *
     * @throws {JsonWebTokenError | TokenExpiredError} If token is invalid or expired
     */
    public static verifyToken(token: string): string | JwtPayload  {
        // const decryptedToken = EncryptionService.decryptAES(token)
        return jwt.verify(token, jwtConfig.secret) as JwtPayload | string
    }

    /**
     * @property jwtExtractor
     * @description Custom JWT extractor for Passport strategy.
     * Retrieves JWT from session (e.g., stored in cookies).
     *
     * @type {Function}
     */
    public static jwtExtractor = ExtractJwt.fromExtractors([
        (req: Request) => {
            return req?.session?.jwt ?? null // Extract JWT from cookies
        }
    ])

}