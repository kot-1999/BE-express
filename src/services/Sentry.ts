import * as SentryNode from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from 'config';

import { IConfig } from '../types/config'

/**
 * @function sentryInit
 * @description Initializes Sentry for error tracking and performance monitoring.
 * Returns the Sentry instance if configuration is provided, otherwise returns null.
 *
 * @param {IConfig['sentry']} config - Sentry configuration (DSN, environment, sampling rates, etc.)
 *
 * @returns {typeof SentryNode | null} Initialized Sentry instance or null if config is missing
 */
function sentryInit(config: IConfig['sentry']) {
    if (!config) {
        return null
    }
    SentryNode.init({
        debug: config.debug,
        environment: config.environment,
        dsn: config.dsn,
        integrations: [
            nodeProfilingIntegration()
        ],
        // includeLocalVariables: true,
        // spotlight: true,
        tracesSampleRate: config.tracesSampleRate,
        profilesSampleRate: config.profilesSampleRate,
        release: config.release
    })
    return SentryNode
}

/**
 * @constant Sentry
 * @description Singleton Sentry instance initialized with application configuration.
 * Can be null if Sentry is not configured.
 *
 * @type {typeof SentryNode | null}
 */
const sentryConfig = config.get<IConfig['sentry']>('sentry')

const Sentry = sentryInit(sentryConfig)

export default Sentry
