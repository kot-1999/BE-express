import 'dotenv/config'

export default <{ app: { port: string, host: string} }> {
    app: {
        port: process.env.PORT,
        host: process.env.HOST,
    }
}