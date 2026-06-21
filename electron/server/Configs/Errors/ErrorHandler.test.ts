import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { throwError, processError, middlewareError, handleIpcError, wrapIpcHandler } from './ErrorHandler.js'
import { ErrorCode } from './errorCode.js'

describe('ErrorHandler', () => {
  describe('throwError', () => {
    it('should throw an error with code', () => {
      expect(() => {
        throwError('Test error', ErrorCode.INTERNAL_ERROR)
      }).toThrow('Test error')
    })

    it('should throw an error with default code if not provided', () => {
      expect(() => {
        throwError('Test error', undefined as any)
      }).toThrow('Test error')
    })
  })

  describe('processError', () => {
    it('should process Error instances correctly', () => {
      const error = new Error('Test error');
      (error as any).code = ErrorCode.VALIDATION_ERROR

      const result = processError(error, 'testContext')

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(result.message).toBe('Test error')
      expect(result.contexts).toContain('testContext')
    })

    it('should process unknown errors as strings', () => {
      const result = processError('Unknown error', 'testContext')

      expect(result.code).toBe(ErrorCode.INTERNAL_ERROR)
      expect(result.message).toBe('Unknown error')
      expect(result.contexts).toContain('testContext')
    })

    it('should accumulate contexts without duplicates', () => {
      const error = new Error('Test error');
      (error as any).code = ErrorCode.INTERNAL_ERROR;
      (error as any).contexts = ['context1']

      const result = processError(error, 'context2')

      expect(result.contexts).toEqual(['context1', 'context2'])
    })

    it('should not duplicate the same context', () => {
      const error = new Error('Test error');
      (error as any).code = ErrorCode.INTERNAL_ERROR;
      (error as any).contexts = ['context1']

      const result = processError(error, 'context1') // Same context

      expect(result.contexts).toEqual(['context1']) // No duplicate
    })
  })

  describe('middlewareError', () => {
    it('should return an Error object with the specified code', () => {
      const result = middlewareError('Access denied', ErrorCode.ACCESS_DENIED)
            
      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('Access denied')
      expect((result as any).code).toBe(ErrorCode.ACCESS_DENIED)
      expect((result as any).contexts).toEqual([])
    })
  })

  describe('handleIpcError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should normalize error and return an IPC compatible error object', () => {
      const error = new Error('Database connection failed');
      (error as any).code = ErrorCode.INTERNAL_ERROR;
      
      const result = handleIpcError(error, 'testContext')
      
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Database connection failed',
          contexts: ['testContext']
        }
      })
      
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('wrapIpcHandler', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should return ok: true and data when handler succeeds', async () => {
      const mockHandler = vi.fn().mockResolvedValue('success data')
      const wrapped = wrapIpcHandler(mockHandler, 'testContext')
      
      const mockEvent = {} as any
      const result = await wrapped(mockEvent, { some: 'payload' })
      
      expect(result).toEqual({
        ok: true,
        data: 'success data'
      })
      expect(mockHandler).toHaveBeenCalledWith(mockEvent, { some: 'payload' })
    })

    it('should return ok: false and normalized error when handler fails', async () => {
      const error = new Error('Action failed');
      (error as any).code = ErrorCode.VALIDATION_ERROR;
      const mockHandler = vi.fn().mockRejectedValue(error)
      const wrapped = wrapIpcHandler(mockHandler, 'testContext')
      
      const mockEvent = {} as any
      const result = await wrapped(mockEvent, { some: 'payload' })
      
      expect(result).toEqual({
        ok: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Action failed',
          contexts: ['testContext']
        }
      })
    })
  })
})
