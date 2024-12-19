import 'colors'
import http from 'http'

import config from 'config'

import app from './app'
import { IConfig } from './types/config'

const appConfig = config.get<IConfig['app']>('app')

const httpServer = http.createServer(app)

httpServer.listen(appConfig.port).on('listening', () => {
    // eslint-disable-next-line no-console
    console.log(
        `Server started in ${process.env.NODE_ENV} mode at PORT ${appConfig.port}`
            .green
    )
})

export default httpServer
