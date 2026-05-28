import path from 'node:path';

import config from 'config';
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'

import { IConfig } from '../types/config';

const i18nConfig = config.get<IConfig['i18n']>('i18n')

i18next
    .use(middleware.LanguageDetector)
    .use(Backend)
    .init({
        preload: i18nConfig.preload,
        debug: i18nConfig.debug,
        load: i18nConfig.load,

        fallbackLng: {
            default: i18nConfig.fallbackLng.default
        },

        ns: i18nConfig.ns,
        defaultNS: i18nConfig.defaultNS,

        backend: {
            loadPath: path.join(__dirname, '/../..', i18nConfig.backend.loadPath)
        },

        interpolation: {
            escapeValue: i18nConfig.interpolation?.escapeValue
        }
    })

export default i18next