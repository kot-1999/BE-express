import SMTPConnection from 'nodemailer/lib/smtp-connection'
import { OAuth2StrategyOptionsWithoutRequiredURLs } from 'passport-google-oauth20'
import { JwtFromRequestFunction } from 'passport-jwt'

export interface IConfig {
  app: {
    port: string
  }
  database: {
    postgresURL: string
  }
  googleStrategy: OAuth2StrategyOptionsWithoutRequiredURLs
  cookieSession: {
    name: string
    maxAge: number
    keys: string[]
    secure: boolean
  }
  jwt: {
    secret: string,
    expiresIn: string
  }
  encryption: {
    key: string
  }
  passport: {
    jwtFromCookie: JwtFromRequestFunction,
    jwtFromRequestHeader: JwtFromRequestFunction
  }
  email: SMTPConnection. Options & { auth: { pass: string, user: string } }
}
