import * as Sentry from '@sentry/node'
import config from 'config';

import logger from './Logger';
import { IConfig } from '../types/config';

const sentryConfig = config.get<IConfig['sentry']>('sentry')

class SentryService {
    private sentryConfig: IConfig['sentry']

    constructor(sentryConfig: IConfig['sentry']) {
        this.sentryConfig = sentryConfig
        logger.debug(JSON.stringify(sentryConfig))
        Sentry.init({
            environment: this.sentryConfig.environment.toString(),
            dsn: this.sentryConfig.dsn.toString(),
            integrations: this.sentryConfig.integrations,
            tracesSampleRate: this.sentryConfig.tracesSampleRate
        })
        logger.info(`SentryService initialized with ${this.sentryConfig.tracesSampleRate} traces sample rate`)
    }
}

const sentryService = new SentryService(sentryConfig)
export default sentryService