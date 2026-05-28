import { S3ClientConfig } from '@aws-sdk/client-s3'
import { NodeOptions } from '@sentry/node';
import { Options as RateLimitRedisOptions } from 'express-rate-limit';
import { SessionOptions } from 'express-session'
import helmet from 'helmet';
import { InitOptions } from 'i18next';
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
    name: string
    port: string
    env: NodeEnv
    frontendUrl: string
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
    error: LoggerCommonConfig & { isLoggedToSentry: boolean },
    debug: LoggerCommonConfig,
  },
  sentry:  (NodeOptions & {
    environment: NodeEnv,
    dsn: string,
    tracesSampleRate: number,
    profilesSampleRate: number,
    release: string
    debug: boolean
  }) | null,
  s3: S3ClientConfig & {
    endpoint: string
  },
  i18n: InitOptions & {
    fallbackLng: { default: string[] }
    backend: { loadPath: string }
  },
}
