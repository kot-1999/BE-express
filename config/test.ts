import 'dotenv/config'
import { IConfig } from '../src/types/config'

const { env } = process
const x = '2'
export default <IConfig> {
    app: {
        port: env.PORT,
        asd: env.PORT && x === env.PORT ? env.PORT : env.PORT
    }
}