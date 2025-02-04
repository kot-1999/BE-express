import config from 'config'
import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'

import { IConfig } from '../types/config'
import { NodeEnv } from '../utils/enums';

class Logger {
    private errorLogger
    private infoLogger
    private warnLogger
    private debugLogger
    private loggerFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(), // Converts logs into structured JSON format
        winston.format.errors({ stack: true }), // Captures error stack trace
        winston.format.printf(({ timestamp, level, message, stack }) =>
            stack
                ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`
                : `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
    )
    
    constructor(env: NodeEnv) {
        const commonConfig = {
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        }
        
        // INFO
        this.infoLogger = winston.createLogger({
            format: this.loggerFormat,
            level: 'info',
            exitOnError: false,
            transports: [
                new WinstonDailyRotateFile({
                    filename: `logs/${env}/info/%DATE%.log`,
                    level: 'info',
                    ...commonConfig
                }),
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize({ all: true })),
                    level: 'info'
                })
            ]
        })
        
        // ERROR
        this.errorLogger = winston.createLogger({
            format: this.loggerFormat,
            level: 'error',
            exitOnError: false,
            transports: [
                new WinstonDailyRotateFile({
                    filename: `logs/${env}/error/%DATE%.log`,
                    level: 'error',
                    ...commonConfig
                }),
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize({ all: true })),
                    level: 'error'
                })
            ]
        })
        
        // WARN
        this.warnLogger = winston.createLogger({
            format: this.loggerFormat,
            level: 'warn',
            exitOnError: false,
            transports: [
                new WinstonDailyRotateFile({
                    filename: `logs/${env}/warn/%DATE%.log`,
                    level: 'warn',
                    ...commonConfig
                }),
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize({ all: true })),
                    level: 'warn'
                })
            ]
        })

        // DEBUG
        this.debugLogger = winston.createLogger({
            format: this.loggerFormat,
            level: 'debug',
            exitOnError: false,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize({ all: true })),
                    level: 'debug'
                })
            ]
        })
        this.info = this.infoLogger.info.bind(this.infoLogger)
        this.debug = this.debugLogger.debug.bind(this.debugLogger)
        this.error = this.errorLogger.error.bind(this.errorLogger)
        this.warn = this.warnLogger.warn.bind(this.warnLogger)

    }
    
    public info
    public debug
    public error
    public warn
}

const appConfig = config.get<IConfig['app']>('app')

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
})

const logger = new Logger(appConfig.env)
export default logger
