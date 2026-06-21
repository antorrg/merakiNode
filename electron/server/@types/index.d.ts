import 'express'
import { type JwtPayload } from '../Shared/Auth/Session'
import { type TokenSaved } from '../Features/auth/typeJwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
      userInfo?: { userId?: string, userRole?: number }
      tokenData?: TokenSaved
    }
  }
}
