
module.exports = {
    input: ['src/**/*.{ts,js}'],

    output: './',

    options: {
        debug: false,
        lngs: ['en', 'ua', 'sk', 'de'],
        defaultLng: 'en',
        ns: ['translation'],
        parse: {
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        defaultNs: 'translation',
        keySeparator: false,
        nsSeparator: false,
        func: {
            list: ['i18next.t', 't'],
            extensions: ['.ts', '.ejs']
        },

        resource: {
            loadPath: 'locales/{{lng}}/{{ns}}.json',
            savePath: 'locales/{{lng}}/{{ns}}.json',
            jsonIndent: 1
        },

        sort: true,
        removeUnusedKeys: false,

        defaultValue: (lng, ns, key) => key
    }
}