module.exports = {
    exit: true,
    bail: false,
    require: ['./tests/global.ts'],
    parallel: true,
    jobs: 2,
    timeout: 30000,
    spec: ['./tests/**/*.test.ts']
}
