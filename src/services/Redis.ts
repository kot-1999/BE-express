import config from 'config'
import { createClient } from 'redis'

import logger from './Logger';
import { IConfig } from '../types/config'

/**
 * @class RedisService
 * @description Wrapper around Redis client.
 * Handles connection setup, configuration, and provides access to the Redis instance.
 *
 * @param {IConfig['redis']} redisConfig - Redis configuration (host, port, credentials, etc.)
 *
 * @property {ReturnType<typeof createClient>} redisClient - Redis client instance
 * @property {IConfig['redis']} redisConfig - Stored Redis configuration
 *
 * @method getRedisClient Returns the Redis client instance
 */
export class RedisService {
    private redisClient: ReturnType<typeof createClient>
    public readonly redisConfig: IConfig['redis']

    /**
     * @constructor
     * @param {IConfig['redis']} redisConfig - Redis configuration
     */
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
        /**
         * @method getRedisClient
         * @description Returns the initialized Redis client instance
         *
         * @returns {ReturnType<typeof createClient>} Redis client
         */
        this.redisClient.on('connect', () => {
            logger.info(`Connected to Redis at PORT ${this.redisConfig.socket.port}`)
        })

        this.redisClient.on('error', (err) => {
            logger.error('Redis connection error', err)
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
