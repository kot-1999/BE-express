import * as path from 'node:path'

import config from 'config'
import ejs from 'ejs'
import { compile, compiledFunction } from 'html-to-text'
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

import { JwtService } from './Jwt'
import { IConfig } from '../types/config'
import { EmailDataType } from '../types/types'
import { EmailType, JwtAudience } from '../utils/enums'
import { IError } from '../utils/IError'

class EmailService {
    private transporter: nodemailer.Transporter
    private config: IConfig['email']
    private htmlToTextCompiler: compiledFunction

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
        })
    }

    constructor(config: IConfig['email']) {
        this.config = config
        this.initTransporter()
        this.htmlToTextCompiler = compile()
    }
     
    private async buildRegistered(data: EmailDataType<EmailType.registered>): Promise<Mail.Options & { html: string }> {
        const templatePath = path.join(__dirname, 'emailTemplates', 'registration.ejs')
        const templateData = {
            firstName: data.firstName ?? 'dear customer',
            lastName: data.lastName ?? '',
            email: data.email
        }

        const htmlContent = await ejs.renderFile(templatePath, templateData)

        const mailOptions = {
            from: this.config.fromAddress,
            to: data.email,
            subject: 'Welcome to BE-proj!',
            html: htmlContent
        }

        return mailOptions
    }

    private async buildForgotPassword(data: EmailDataType<EmailType.forgotPassword>)
        : Promise<Mail.Options & { html: string }> {
        const templatePath = path.join(__dirname, 'emailTemplates', 'forgotPassword.ejs')
        const templateData = {
            firstName: data.firstName ?? 'dear customer',
            lastName: data.lastName ?? '',
            link: `http//www.localhost:3001/reset-password?token=${JwtService.generateToken({
                id: data.id,
                aud: JwtAudience.forgotPassword
            })}`
        }
        const htmlContent = await ejs.renderFile(templatePath, templateData)

        const mailOptions = {
            from: this.config.fromAddress,
            to: data.email,
            subject: 'Welcome to BE-proj!',
            html: htmlContent
        }

        return mailOptions 
    }

    public async sendEmail<T extends EmailType>(
        emailType: T,
        data: EmailDataType<T>
    ): Promise<void> {
        let mailOptions
        switch (emailType) {
        case EmailType.registered:
            mailOptions = await this.buildRegistered(data as EmailDataType<EmailType.registered>)
            break
        case EmailType.forgotPassword:
            mailOptions = await this.buildForgotPassword(data as EmailDataType<EmailType.forgotPassword>)
            break
        default:
            throw new IError(500, `Unknown email type: ${emailType}`)
        }

        await this.transporter.sendMail({
            ...mailOptions,
            text: this.htmlToTextCompiler(mailOptions.html) // text version of html
        }).catch((err) => {
            console.error('SENDING EMAIL ERROR', err)
        })
    }
}
const emailConfig = config.get<IConfig['email']>('email')
const emailService = new EmailService(emailConfig)

export default emailService
