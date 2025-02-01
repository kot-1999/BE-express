import config from 'config'
import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'

import { IConfig } from '../types/config'

const appConfig = config.get<IConfig['app']>('app')

winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
})

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(), // Converts logs into structured JSON format
        winston.format.errors({ stack: true }), // Captures error stack trace
        winston.format.printf(({ timestamp, level, message, stack }) =>
            stack
                ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}`
                : `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        // INFO
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig.env}/info/%DATE%.log`,
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize({ all: true })),
            level: 'info'
        }),

        // WARNING
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig.env}/warning/%DATE%.log`,
            level: 'warning',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize({ all: true })),
            level: 'warning'
        }),

        // ERROR
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig.env}/error/%DATE%.log`,
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        })
    ],
    exitOnError: false
})

export default logger