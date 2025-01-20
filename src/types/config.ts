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
    secretOrKey: string
    jwtFromRequest: JwtFromRequestFunction
  }
  email: {
    host: string
    port: string
    user: string
    password: string
    fromAddress: string
  }
}
