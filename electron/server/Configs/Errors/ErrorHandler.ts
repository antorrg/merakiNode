import { ErrorCode, type ErrorCodeType } from './errorCode.js'
import type { IpcMainInvokeEvent } from 'electron'


export interface ServerActionError {
  ok: false,
  message: string,
  data?: string
}
export interface AppError {
  code: ErrorCodeType
  message: string
  contexts: string[]
}

class CustomError extends Error {
  public log: boolean
  constructor(log: boolean = false) {
    super()
    this.log = log
    Object.setPrototypeOf(this, CustomError.prototype)
  }

  throwError = (message: string, code: ErrorCodeType): never => {
    const error = new Error(message) as Error & {
      code: ErrorCodeType
      contexts: string[]
    }
    error.code = code ?? ErrorCode.INTERNAL_ERROR
    error.contexts = []
    throw error
  }
  middlewareError = (message: string, code: ErrorCodeType): Error => {
    const error = new Error(message) as Error & {
      code: ErrorCodeType
      contexts: string[]
    }
    error.code = code ?? ErrorCode.INTERNAL_ERROR
    error.contexts = []
    return error
  }

  processError(err: unknown, context: string): AppError {
    let normalized: AppError

    if (err instanceof Error) {
      normalized = {
        code: (err as any).code ?? ErrorCode.INTERNAL_ERROR,
        message: err.message,
        contexts: Array.isArray((err as any).contexts)
          ? (err as any).contexts
          : []
      }
    } else {
      normalized = {
        code: ErrorCode.INTERNAL_ERROR,
        message: String(err),
        contexts: []
      }
    }

    const last = normalized.contexts.at(-1)
    if (last !== context) {
      normalized.contexts.push(context)
    }

    return normalized
  }

  processAndThrow = (err: unknown, context: string): never => {
    const error = err instanceof Error ? err : new Error(String(err)) as any
    
    if (!error.code) error.code = ErrorCode.INTERNAL_ERROR
    if (!Array.isArray(error.contexts)) error.contexts = []
    
    if (error.contexts.at(-1) !== context) {
      error.contexts.push(context)
    }
    
    throw error
  }
  handleIpcError = (err: unknown, context: string) => {
    const normalized = this.processError(err, context)

    if (this.log) {
      console.error(
        {
          code: normalized.code,
          contexts: normalized.contexts,
          message: normalized.message
        },
        normalized.message
      )
    }

    return {
      ok: false as const,
      error: normalized
    }
  }

  wrapIpcHandler = <TArgs = any, TResult = any>(
    handler: (event: Electron.IpcMainInvokeEvent, payload: TArgs) => Promise<TResult>,
    context: string
  ) => {
    return async (event: Electron.IpcMainInvokeEvent, payload: TArgs) => {
      try {
        const data = await handler(event, payload)
        return {
          ok: true as const,
          data
        }
      } catch (err) {
        return this.handleIpcError(err, context)
      }
    }
  }
}

const errorHandler = new CustomError(true)


export const throwError = errorHandler.throwError
export const middlewareError = errorHandler.middlewareError
export const processError = errorHandler.processError
export const processAndThrow = errorHandler.processAndThrow
export const handleIpcError = errorHandler.handleIpcError
export const wrapIpcHandler = errorHandler.wrapIpcHandler
