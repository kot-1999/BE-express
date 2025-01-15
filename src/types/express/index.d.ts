import { User } from '@prisma/client'
import { Request as OriginalRequest } from 'express'

declare module 'express' {
    interface Request extends OriginalRequest {
        body: {}
        query: {}
        params: {}
        cookies: {
            jwt: string | undefined
        }
    }

    interface AuthUserRequest extends Request {
        user: User
    }
}