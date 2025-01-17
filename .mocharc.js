module.exports = {
    exit: true,
    bail: false,
    require: ['./tests/global.ts'],
    parallel: false,
    jobs: 1,
    import: 'tsx',
    timeout: 30000,
    spec: ['./tests/**/*.test.ts']
}
