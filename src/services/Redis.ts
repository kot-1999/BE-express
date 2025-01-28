import config from 'config'
import { createClient } from 'redis'

import { IConfig } from '../types/config'

export class RedisService {
    private redisClient: ReturnType<typeof createClient>
    public readonly redisConfig: IConfig['redis']

    constructor(redisConfig: IConfig['redis']) {
        this.redisConfig = redisConfig

        this.redisClient = createClient({
            name: this.redisConfig.name,
            username: this.redisConfig.username,
            password: this.redisConfig.password,
            socket: {
                host: redisConfig.socket?.host,
                port: redisConfig.socket?.port
            }
        })

        this.redisClient.on('connect', () => {
            console.log(`Connected to Redis at PORT ${this.redisConfig.socket.port}`.green)
        })

        this.redisClient.on('error', (err) => {
            console.error('Redis connection error:', err)
        })

        this.redisClient.connect()

    }

    public getRedisClient() {
        return this.redisClient
    }
}

const redisConfig = config.get<IConfig['redis']>('redis')
const  redis = new RedisService(redisConfig)

export default redis
