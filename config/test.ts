import 'dotenv/config'
import { IConfig } from '../src/types/config'

const { env } = process

export default <IConfig> {
    app: {
        port: env.PORT
    },
    database: {
        postgresURL: process.env.POSTGRES_URL
    }
}