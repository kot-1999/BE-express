import { expect } from 'chai'
import config from 'config'

import { EncryptionService } from '../../../src/services/Encryption'
import { IConfig } from '../../../src/types/config'

describe('Encryption', () => {
    const encryptionConfig = config.get<IConfig['encryption']>('encryption')
    let encryptedValue: string
    const value = 'Test123.'
    const hashValue = '1d403e9031bc3c00d63f82e8b3f911a3da2620ae1db0a54b68e86dcca1751b62'

    it('Should encrypt string using AES', () => {
        encryptedValue = EncryptionService.encryptAES(value, encryptionConfig.key)
        expect(encryptedValue).to.be.a('string')
        expect(encryptedValue).not.to.equal(value)
    })

    it('Should decrypt string using AES', () => {
        const result = EncryptionService.decryptAES(encryptedValue, encryptionConfig.key)
        expect(result).to.eq(value)

    })

    it('Should create hash from a string', () => {
        const hash = EncryptionService.hashSHA256(value)
        expect(hash).to.eq(hashValue)
    })
})