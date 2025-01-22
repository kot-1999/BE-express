import 'jsonwebtoken'
import { JwtAudience } from '../../utils/enums'

declare module 'jsonwebtoken' {
    export interface JwtPayload {
        id: string
        aud: JwtAudience
    }
}