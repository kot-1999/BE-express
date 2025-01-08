import config from 'config'

import { EncryptionService } from '../../src/services/Encryption'
import { IConfig } from '../../src/types/config'

describe('Encryption', () => {
    const encryptionConfig = config.get<IConfig['encryption']>('encryption')
    it('Should encrypt string using AES', () => {
        const res = EncryptionService.encryptAES('Test123.', encryptionConfig.key)
    })
})