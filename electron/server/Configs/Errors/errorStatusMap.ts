import { ErrorCode, type ErrorCodeType } from './errorCode.js'

export const ErrorStatus: Record<ErrorCodeType, number> = {
  // generic
  [ErrorCode.UNKNOWN_ERROR]: 500,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.NOT_IMPLEMENTED]: 501, // Not Implemented
  [ErrorCode.OPERATION_FAILED]: 500,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.DUPLICATE_ENTRY]: 409, // Conflict
  [ErrorCode.DATABASE_ERROR]: 500,

  // validation
  [ErrorCode.VALIDATION_ERROR]: 400, // Bad Request
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.REQUIRED_FIELD_MISSING]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.INVALID_TYPE]: 400,
  [ErrorCode.OUT_OF_RANGE]: 400,
  [ErrorCode.VALUE_NOT_ALLOWED]: 400,
  [ErrorCode.DUPLICATE_VALUE]: 409, // Conflict

  // authorization
  [ErrorCode.ACCESS_DENIED]: 401, // Unauthorized
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403, // Forbidden
  [ErrorCode.ROLE_NOT_ALLOWED]: 403,
  [ErrorCode.FORBIDDEN]: 403,

  // resources
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_CONFLICT]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 423, // Locked (WebDAV) o 409

  // system
  [ErrorCode.SERVICE_UNAVAILABLE]: 503, // Service Unavailable
  [ErrorCode.SERVICE_TIMEOUT]: 504, // Gateway Timeout
  [ErrorCode.DEPENDENCY_FAILURE]: 502, // Bad Gateway
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429, // Too Many Requests

  // persistence
  [ErrorCode.DATA_READ_ERROR]: 500,
  [ErrorCode.DATA_WRITE_ERROR]: 500,
  [ErrorCode.DATA_INTEGRITY_ERROR]: 500,
  [ErrorCode.DATA_CONSTRAINT_VIOLATION]: 409,
  [ErrorCode.DATA_CONFLICT]: 409,

  // security
  [ErrorCode.SECURITY_VIOLATION]: 403,
  [ErrorCode.CSRF_DETECTED]: 403,
  [ErrorCode.SUSPICIOUS_ACTIVITY]: 403,
  [ErrorCode.REQUEST_BLOCKED]: 403,

  // operations
  [ErrorCode.OPERATION_NOT_ALLOWED]: 405, // Method Not Allowed
  [ErrorCode.OPERATION_CONFLICT]: 409,
  [ErrorCode.INVALID_OPERATION_STATE]: 409,
  [ErrorCode.PRECONDITION_FAILED]: 412, // Precondition Failed

  // files
  [ErrorCode.FILE_REQUIRED]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413, // Payload Too Large
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: 415, // Unsupported Media Type
  [ErrorCode.FILE_UPLOAD_FAILED]: 500,
  [ErrorCode.FILE_DELETE_FAILED]: 500,

  // session
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.SESSION_INVALID]: 401,
  [ErrorCode.CLIENT_STATE_INVALID]: 400,

  // environment
  [ErrorCode.CONFIG_MISSING]: 500,
  [ErrorCode.CONFIG_INVALID]: 500,
  [ErrorCode.ENVIRONMENT_ERROR]: 500
}