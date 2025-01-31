import { SessionOptions } from 'express-session'
import SMTPConnection from 'nodemailer/lib/smtp-connection'
import { OAuth2StrategyOptionsWithoutRequiredURLs } from 'passport-google-oauth20'
import { JwtFromRequestFunction } from 'passport-jwt'
import { RedisClientOptions } from 'redis'

export interface IConfig {
  app: {
    port: string
  }
  database: {
    postgresURL: string
  }
  googleStrategy: OAuth2StrategyOptionsWithoutRequiredURLs
  cookieSession: SessionOptions & { cookie: NonNullable<SessionOptions['cookie']> }
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
  email: SMTPConnection. Options & { auth: { pass: string, user: string }, fromAddress: string },
  redis: {
    socket: {
      host: string,
      port: number
    }
  } & RedisClientOptions
}
