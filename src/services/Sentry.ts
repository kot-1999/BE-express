import * as Sentry from '@sentry/node'
import config from 'config';
import { Router } from 'express'

import logger from './Logger';
import prisma from './Prisma'
import { IConfig } from '../types/config'

const sentryConfig = config.get<IConfig['sentry']>('sentry')
logger.debug(sentryConfig.dsn)

function sentryInit(app: Router) {
    Sentry.init({
        debug: true,
        environment: sentryConfig.environment,
        dsn: sentryConfig.dsn,
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),
            new Sentry.Integrations.Postgres(),
            new Sentry.Integrations.Express({ app }),
            new Sentry.Integrations.Prisma({ client: prisma })
        ],
        // includeLocalVariables: true,
        // spotlight: true,
        tracesSampleRate: sentryConfig.tracesSampleRate,
        release: 'latest'
    })
    logger.info(`Sentry was initialized: ${Sentry.getCurrentHub().getClient() !== undefined}`)

    // Sentry.captureException(new Error('Manual test error'));
    //
    // Sentry.flush(2000).then(() => {
    //     logger.debug('Flushed events, exiting.');
    //     process.exit();
    // });
    return Sentry
}

export default sentryInit;
