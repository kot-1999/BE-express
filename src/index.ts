import './services/Sentry'
import http from 'http'

import config from 'config'

import app from './app'
import logger from './services/Logger';
import { IConfig } from './types/config'

const appConfig = config.get<IConfig['app']>('app')

const httpServer = http.createServer(app)

httpServer.listen(appConfig.port)
    .on('listening', () => {
        logger.info(`Server started in ${process.env.NODE_ENV} mode at PORT ${appConfig.port}`)
    })
    .on('error', (err) => {
        logger.error('Runtime error: ', err)
    })

export default httpServer
