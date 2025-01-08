import crypto from 'crypto-js'

export class EncryptionService {
    public static hashSHA256(value: string): string {
        return crypto.SHA256(value).toString()
    }

    public static encryptAES(value: string, key: string): string {
        return crypto.AES.encrypt(value, key).toString()
    }

    public static decryptAES(value: string, key: string): string {
        return crypto.AES.decrypt(value, key).toString(crypto.enc.Utf8)
    }
}
