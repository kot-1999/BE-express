import { EmailType } from '../utils/enums'

export type EmailDataType<T extends EmailType> =
    T extends typeof EmailType.registered ? {
        email: string,
        firstName: string | null,
        lastName: string | null
    } :
    T extends typeof EmailType.forgotPassword ? {
        id: string,
        email: string,
        firstName: string | null,
        lastName: string | null
    } : never