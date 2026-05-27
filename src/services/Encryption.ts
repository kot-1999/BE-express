import config from 'config'
import crypto from 'crypto-js'

import { IConfig } from '../types/config'
import { IError } from '../utils/IError';

const encryptionConfig = config.get<IConfig['encryption']>('encryption')

/**
 * @class EncryptionService
 * @description Utility class providing static methods for hashing and encryption.
 * This class is not meant to be instantiated.
 *
 * @throws {IError} When attempting to instantiate the class
 *
 * @method hashSHA256 Generates SHA-256 hash of a given value
 * @method encryptAES Encrypts a string using AES algorithm
 * @method decryptAES Decrypts an AES-encrypted string
 */
export class EncryptionService {
    /**
     * @constructor
     * @description Prevents instantiation of this static utility class
     * @throws {IError}
     */
    constructor() {
        throw new IError(500, "Trying to initialize static 'EncryptionService' class")
    }

    /**
     * @method hashSHA256
     * @description Generates a SHA-256 hash for the given input string
     *
     * @param {string} value - Input string to hash
     * @returns {string} Hashed value (hex string)
     */
    public static hashSHA256(value: string): string {
        return crypto.SHA256(value).toString()
    }

    /**
     * @method encryptAES
     * @description Encrypts a string using AES encryption algorithm
     *
     * @param {string} value - Plain text to encrypt
     * @returns {string} Encrypted string
     */
    public static encryptAES(value: string): string {
        return crypto.AES.encrypt(value, encryptionConfig.key).toString()
    }

    /**
     * @method decryptAES
     * @description Decrypts an AES-encrypted string back to plain text
     *
     * @param {string} value - Encrypted string
     * @returns {string} Decrypted plain text
     */

    public static decryptAES(value: string): string {
        return crypto.AES.decrypt(value, encryptionConfig.key).toString(crypto.enc.Utf8)
    }
}
