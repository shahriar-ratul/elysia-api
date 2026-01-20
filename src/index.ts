import { app } from './app'
import { logger } from './utils/logger'

const port = process.env.PORT || 4000

const server = app.listen(port)

logger.info(
  { port },
  `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
)
