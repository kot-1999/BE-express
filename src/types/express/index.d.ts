import { User } from '@prisma/client'
import { Request as OriginalRequest } from 'express'

declare module 'express' {
    interface Request extends OriginalRequest {
        body: {}
        query: {}
        params: {}
    }

    interface AuthUserRequest extends Request {
        user: User
    }
}