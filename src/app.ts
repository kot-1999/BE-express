import express from 'express'
import config from "config";

const appConfig = config.get('app')


const app = express()

app.use(express.json())


export default app