import { OAuth2StrategyOptionsWithoutRequiredURLs } from 'passport-google-oauth20'

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
  }
  jwt: {
    secret: string,
    expiresIn: string
  }
  encryption: {
    key: string
  }
}
