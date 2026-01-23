import * as SentryNode from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from 'config';

import { IConfig } from '../types/config'

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

const sentryConfig = config.get<IConfig['sentry']>('sentry')

const Sentry = sentryInit(sentryConfig)

export default Sentry
