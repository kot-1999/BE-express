import { Options as RateLimitRedisOptions } from 'express-rate-limit';
import { SessionOptions } from 'express-session'
import helmet from 'helmet';
import { Algorithm } from 'jsonwebtoken';
import SMTPConnection from 'nodemailer/lib/smtp-connection'
import { OAuth2StrategyOptionsWithoutRequiredURLs } from 'passport-google-oauth20'
import { JwtFromRequestFunction } from 'passport-jwt'
import { RedisClientOptions } from 'redis'

import { NodeEnv } from '../utils/enums';

interface LoggerCommonConfig {
  isLoggedToConsole: boolean
}

export interface IConfig {
  app: {
    port: string
    env: NodeEnv
  }
  database: {
    postgresURL: string
  }
  googleStrategy: OAuth2StrategyOptionsWithoutRequiredURLs
  cookieSession: SessionOptions & { cookie: NonNullable<SessionOptions['cookie']> }
  jwt: {
    secret: string,
    expiresIn: number
    algorithm: Algorithm
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
  helmet: {
    contentSecurity: Parameters<typeof helmet.contentSecurityPolicy>[0]
  },
  rateLimiter: Partial<RateLimitRedisOptions>,
  logger: {
    info: LoggerCommonConfig,
    warn: LoggerCommonConfig,
    error: LoggerCommonConfig,
    debug: LoggerCommonConfig,
  },
  sentry: {
    environment: NodeEnv,
    dsn: string,
    tracesSampleRate: number,
    profilesSampleRate: number
  }
}
