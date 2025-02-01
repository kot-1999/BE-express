import config from 'config'
import winston from 'winston'
import WinstonDailyRotateFile from 'winston-daily-rotate-file'

import { IConfig } from '../types/config'

const appConfig = config.get<IConfig['app']>('app')

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(), // Converts logs into structured JSON format
        winston.format.errors({ stack: true }) // Captures error stack trace
    ),
    transports: [
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig}/info/%DATE%.log`,
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        }),
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig}/warning/%DATE%.log`,
            level: 'warning',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        }),
        new WinstonDailyRotateFile({
            filename: `logs/${appConfig}/error/%DATE%.log`,
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            maxSize: '1024m',
            maxFiles: 100
        })
    ],
    exitOnError: false
})

export default logger