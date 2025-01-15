import config from 'config'
import crypto from 'crypto-js'

import { IConfig } from '../types/config'

const encryptionConfig = config.get<IConfig['encryption']>('encryption')

export class EncryptionService {
    public static hashSHA256(value: string): string {
        return crypto.SHA256(value).toString()
    }

    public static encryptAES(value: string): string {
        return crypto.AES.encrypt(value, encryptionConfig.key).toString()
    }

    public static decryptAES(value: string): string {
        return crypto.AES.decrypt(value, encryptionConfig.key).toString(crypto.enc.Utf8)
    }
}
