import * as SentryNode from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from 'config';

import logger from './Logger';
import { IConfig } from '../types/config'

const sentryConfig = config.get<IConfig['sentry']>('sentry')

function sentryInit() {
    SentryNode.init({
        debug: sentryConfig.debug,
        environment: sentryConfig.environment,
        dsn: sentryConfig.dsn,
        integrations: [
            nodeProfilingIntegration()
        ],
        // includeLocalVariables: true,
        // spotlight: true,
        tracesSampleRate: sentryConfig.tracesSampleRate,
        profilesSampleRate: sentryConfig.profilesSampleRate,
        release: sentryConfig.release
    })
    logger.info('Sentry was initialized')
    return SentryNode
}

const Sentry = sentryInit()

export default Sentry
