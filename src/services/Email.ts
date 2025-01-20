import config from 'config'
import nodemailer from 'nodemailer'

import { IConfig } from '../types/config'
import { EmailDataType } from '../types/types'
import { EmailType } from '../utils/enums'
import { IError } from '../utils/IError'

class EmailService {
    private transporter: nodemailer.Transporter
    private config: IConfig['email']

    private initTransporter(): void {
        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth: {
                user: this.config.auth.user,
                pass: this.config.auth.pass
            }
        }).on('error', (err) => {
            console.error('Email Service error', err)
            this.initTransporter()
        })
    }

    constructor(config: IConfig['email']) {
        this.config = config
        this.initTransporter()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private buildRegistered(data: EmailDataType<EmailType.registered>): void {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private buildForgotPassword(data: EmailDataType<EmailType.forgotPassword>): void {}

    public async sendEmail<T extends EmailType>(
        emailType: T,
        data: EmailDataType<T>
    ): Promise<void> {
        switch (emailType) {
        case EmailType.registered:
            this.buildRegistered(data as EmailDataType<EmailType.registered>)
            break
        case EmailType.forgotPassword:
            this.buildForgotPassword(data as EmailDataType<EmailType.forgotPassword>)
            break
        default:
            throw new IError(500, `Unknown email type: ${emailType}`)
        }
    }
}
const emailConfig = config.get<IConfig['email']>('email')
const emailService = new EmailService(emailConfig)

export default emailService
