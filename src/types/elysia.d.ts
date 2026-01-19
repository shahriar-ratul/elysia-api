import type { Logger } from '../utils/logger'
import type { AppAbility } from '../utils/permissions'

declare module 'elysia' {
  interface Context {
    logger: Logger
    admin?: { id: bigint }
    ability?: AppAbility
  }
}
