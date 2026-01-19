declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string
    max?: number
    min?: number
    idleTimeoutMillis?: number
    connectionTimeoutMillis?: number
    allowExitOnIdle?: boolean
  }

  export class Pool {
    constructor(config?: PoolConfig)
    end(): Promise<void>
    on(event: 'connect', listener: () => void): this
    on(event: 'error', listener: (error: unknown) => void): this
  }
}
