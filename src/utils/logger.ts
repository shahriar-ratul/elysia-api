import pino from "pino";

/**
 * Create a configured pino logger instance
 *
 * Features:
 * - Pretty printing in development
 * - Configurable log level via LOG_LEVEL env var
 * - Clean output with timestamp formatting
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

/**
 * Type definition for logger to use in Elysia context
 */
export type Logger = typeof logger;
