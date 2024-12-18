import './utils/vaultConfig'
import 'colors'
import http from 'http'
// import config from 'config'

import './dbSync'
import app from './app'

const httpServer = http.createServer(app)
// const appConfig = config.get('app')


httpServer.listen(3000).on('listening', () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode at port ${3000}`)
})

export default httpServer
