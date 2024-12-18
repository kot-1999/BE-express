import 'dotenv/config'
import {IConfig} from "../src/types/config";

export default <IConfig> {
    app: {
        port: process.env.PORT
    }
}