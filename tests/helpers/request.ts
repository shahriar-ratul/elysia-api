import { app, type App } from '../../src/app'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface TestResponse {
  status: number
  body: unknown
  headers: Headers
  text: string
}

class RequestBuilder {
  private _app: App
  private method: HttpMethod
  private path: string
  private requestHeaders: Record<string, string> = {}
  private requestBody?: unknown
  private expectedStatus?: number

  constructor(appInstance: App, method: HttpMethod, path: string) {
    this._app = appInstance
    this.method = method
    this.path = path
  }

  set(key: string, value: string): this {
    this.requestHeaders[key] = value
    return this
  }

  auth(token: string): this {
    this.requestHeaders['Authorization'] = `Bearer ${token}`
    return this
  }

  send(body: unknown): this {
    this.requestBody = body
    return this
  }

  expect(status: number): this {
    this.expectedStatus = status
    return this
  }

  async end(): Promise<TestResponse> {
    const url = `http://localhost${this.path}`

    const headers: Record<string, string> = { ...this.requestHeaders }

    if (this.requestBody) {
      headers['Content-Type'] = 'application/json'
    }

    const req = new Request(url, {
      method: this.method,
      headers,
      body: this.requestBody ? JSON.stringify(this.requestBody) : undefined
    })

    const response = await this._app.handle(req)
    const text = await response.text()

    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }

    const result: TestResponse = {
      status: response.status,
      body,
      headers: response.headers,
      text
    }

    if (this.expectedStatus !== undefined && response.status !== this.expectedStatus) {
      throw new Error(
        `Expected status ${this.expectedStatus} but got ${response.status}\nResponse: ${text}`
      )
    }

    return result
  }

  then<T = TestResponse>(
    resolve: (value: TestResponse) => T | PromiseLike<T>,
    reject?: (reason: unknown) => T | PromiseLike<T>
  ): Promise<T> {
    return this.end().then(resolve, reject)
  }
}

/**
 * Supertest-like request helper for Elysia
 * Uses app.handle() - no server needed
 *
 * @example
 * const res = await request(app)
 *   .post('/api/v1/admin/auth/sign-in')
 *   .send({ email: 'test@example.com', password: 'pass' })
 *   .expect(200)
 *
 * const res = await request(app)
 *   .get('/api/v1/admin/roles')
 *   .auth(token)
 */
export function request(appInstance: App = app) {
  return {
    get: (path: string) => new RequestBuilder(appInstance, 'GET', path),
    post: (path: string) => new RequestBuilder(appInstance, 'POST', path),
    put: (path: string) => new RequestBuilder(appInstance, 'PUT', path),
    patch: (path: string) => new RequestBuilder(appInstance, 'PATCH', path),
    delete: (path: string) => new RequestBuilder(appInstance, 'DELETE', path)
  }
}
