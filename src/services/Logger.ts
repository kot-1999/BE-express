import config from 'config'
import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'
import TransportStream from 'winston-transport'

import Sentry from './Sentry';
import { IConfig } from '../types/config'
import { NodeEnv } from '../utils/enums';
import { IError } from '../utils/IError';

class SentryErrorTransport extends TransportStream {
    constructor() {
        super()
    }

    log(error: Error | IError, callback: () => void): void {
        Sentry?.captureEvent(error)
        callback()
    }
}

class Logger {
    // Logger
    private errorLogger
    private infoLogger
    private warnLogger
    private debugLogger

    // Variables uninitialized
    private env: NodeEnv
    private loggerConfig: IConfig['logger']
    private sentryConfig: IConfig['sentry']
    // Variables initialized
    private dailyRotateFileCommonConfig = {
        datePattern: 'YYYY-MM-DD',
        maxSize: '1024m',
        maxFiles: 100
    }
    private loggerFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(), // Converts logs into structured JSON format
        winston.format.errors({ stack: true }), // Captures error stack trace
        winston.format.printf(({ timestamp, level, message, stack }) =>
            stack
                ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`
                : `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
    )
    
    constructor(
        env: NodeEnv,
        loggerConfig: IConfig['logger'],
        sentryConfig: IConfig['sentry']
    ) {
        this.env = env
        this.loggerConfig = loggerConfig
        this.sentryConfig = sentryConfig
        winston.addColors({
            error: 'red',
            warn: 'yellow',
            info: 'green',
            debug: 'blue'
        })

        this.infoLogger = this.createLogger('info', this.loggerConfig.info.isLoggedToConsole, false)
        this.errorLogger = this.createLogger(
            'error',
            this.loggerConfig.error.isLoggedToConsole,
            this.loggerConfig.error.isLoggedToSentry
        )
        this.warnLogger = this.createLogger('warn', this.loggerConfig.warn.isLoggedToConsole, false)
        this.debugLogger = this.createLogger('debug', this.loggerConfig.debug.isLoggedToConsole, false)

        this.info = this.infoLogger.info.bind(this.infoLogger)
        this.debug = this.debugLogger.debug.bind(this.debugLogger)
        this.error = this.errorLogger.error.bind(this.errorLogger)
        this.warn = this.warnLogger.warn.bind(this.warnLogger)

    }

    private createLogger(
        level: 'info' | 'debug' | 'warn' | 'error',
        isLoggedToConsole: boolean,
        isLoggedToSentry: boolean
    ): ReturnType<typeof winston.createLogger> {
        const transports: winston.transport | winston.transport[] = [
            new WinstonDailyRotateFile({
                filename: `logs/${this.env}/${level}/%DATE%.log`,
                level,
                ...this.dailyRotateFileCommonConfig
            })
        ]

        if (isLoggedToConsole) {
            transports.push(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize({ all: true })),
                level
            }))
        }

        if (isLoggedToSentry) {
            if (this.sentryConfig) {
                transports.push(new SentryErrorTransport())
            } else {
                throw new Error('Logging to sentry was required, but config is not provided')
            }
        }
        
        return this.debugLogger = winston.createLogger({
            format: this.loggerFormat,
            level,
            exitOnError: false,
            transports
        })
    }

    // Bound logger functions
    public info: typeof winston.info
    public debug: typeof winston.debug
    public error: typeof winston.error
    public warn: typeof winston.warn
}

const appConfig = config.get<IConfig['app']>('app')
const sentryConfig = config.get<IConfig['sentry']>('sentry')
const loggerConfig = config.get<IConfig['logger']>('logger')

const logger = new Logger(appConfig.env, loggerConfig, sentryConfig)
export default logger
