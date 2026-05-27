import config from 'config'
import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'
import TransportStream from 'winston-transport'

import Sentry from './Sentry';
import { IConfig } from '../types/config'
import { NodeEnv } from '../utils/enums';
import { IError } from '../utils/IError';

/**
 * @class SentryErrorTransport
 * @description Custom Winston transport for sending error logs to Sentry.
 *
 * @method log Sends error event to Sentry
 */
class SentryErrorTransport extends TransportStream {
    constructor() {
        super()
    }

    /**
     * @method log
     * @description Captures error and sends it to Sentry
     *
     * @param {Error | IError} error - Error instance to log
     * @param {Function} callback - Callback to signal completion
     * @returns {void}
     */
    log(error: Error | IError, callback: () => void): void {
        Sentry?.captureEvent(error)
        callback()
    }
}

/**
 * @class Logger
 * @description Centralized logging service using Winston.
 * Supports file rotation, console logging, and optional Sentry integration.
 *
 * @param {NodeEnv} env - Current application environment
 * @param {IConfig['logger']} loggerConfig - Logger configuration
 * @param {IConfig['sentry']} sentryConfig - Sentry configuration
 *
 * @property errorLogger - Logger instance for error level
 * @property infoLogger - Logger instance for info level
 * @property warnLogger - Logger instance for warn level
 * @property debugLogger - Logger instance for debug level
 *
 * @method info Logs informational messages
 * @method debug Logs debug messages
 * @method warn Logs warning messages
 * @method error Logs error messages
 */
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

    /**
     * @constructor
     * @param {NodeEnv} env - Application environment
     * @param {IConfig['logger']} loggerConfig - Logger configuration
     * @param {IConfig['sentry']} sentryConfig - Sentry configuration
     */
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

    /**
     * @method createLogger
     * @description Creates a Winston logger instance for a specific log level
     *
     * @param {'info' | 'debug' | 'warn' | 'error'} level - Log level
     * @param {boolean} isLoggedToConsole - Whether to log to console
     * @param {boolean} isLoggedToSentry - Whether to send logs to Sentry
     *
     * @returns {ReturnType<typeof winston.createLogger>}
     *
     * @throws {Error} If Sentry logging is enabled but config is missing
     */
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

    /**
     * @method info
     * @description Logs informational messages
     */
    public info: typeof winston.info

    /**
     * @method debug
     * @description Logs debug messages
     */
    public debug: typeof winston.debug

    /**
     * @method error
     * @description Logs error messages
     */
    public error: typeof winston.error

    /**
     * @method warn
     * @description Logs warning messages
     */

    public warn: typeof winston.warn
}

const appConfig = config.get<IConfig['app']>('app')
const sentryConfig = config.get<IConfig['sentry']>('sentry')
const loggerConfig = config.get<IConfig['logger']>('logger')

const logger = new Logger(appConfig.env, loggerConfig, sentryConfig)
export default logger
