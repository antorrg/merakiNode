export const AUTH_CHANNELS = [
  'auth:login',
  'auth:getSession',
  'auth:logout',
  'auth:check-users',
  'auth:create-initial-owner',
] as const

export const PATIENT_CHANNELS = [
  'patient:register',
  'patient:getAll',
  'patient:getById',
  'patient:updateContact',
  'patient:delete',
] as const

export const DIAGNOSIS_CHANNELS = [
  'diagnosis:add',
  'diagnosis:getActive',
  'diagnosis:update',
  'diagnosis:delete',
] as const

export const TREATMENT_CHANNELS = [
  'treatment:add',
  'treatment:getByPatient',
  'treatment:update',
  'treatment:delete',
] as const

export const USER_CHANNELS = [
  'user:create',
  'users:getAll',
  'user:getById',
  'user:updateProfile',
  'user:updateStatus',
  'user:updatePassword',
  'user:delete',
] as const

export const HISTORY_CHANNELS = [
  'history:getFull',
] as const

export const ENTRY_CHANNELS = [
  'entry:add',
  'entry:getByPatient',
  'entry:update',
  'entry:delete',
  'historyEntry:add',
  'historyEntry:getByPatient',
  'historyEntry:update',
  'historyEntry:delete',
] as const

export const LOGGER_CHANNELS = [
  'logger:log',
  'logger:getLogs',
  'logger:clear',
  'logger:export',
  'logger:setLevel',
  'logs.getAll',
  'logs.getById',
  'logs.update',
  'logs.delete',
  'logs.deleteAll',
] as const

export const APPOINTMENT_CHANNELS = [
  'appointment:create',
  'appointment:getByRange',
  'appointment:getByPatient',
  'appointment:updateStatus',
  'appointment:delete',
] as const

export const PDF_EXPORT_CHANNELS = [
  'pdf:generate',
  'pdf:getByPatient',
] as const

// Lista blanca de canales permitidos para invocación (invoke)
export const ALLOWED_INVOKE_CHANNELS = new Set<string>([
  ...AUTH_CHANNELS,
  ...PATIENT_CHANNELS,
  ...DIAGNOSIS_CHANNELS,
  ...TREATMENT_CHANNELS,
  ...USER_CHANNELS,
  ...HISTORY_CHANNELS,
  ...ENTRY_CHANNELS,
  ...LOGGER_CHANNELS,
  ...APPOINTMENT_CHANNELS,
  ...PDF_EXPORT_CHANNELS,
])

// Lista blanca de canales permitidos para eventos de escucha (on)
export const ALLOWED_LISTEN_CHANNELS = new Set<string>([
  'main-process-message'
])

// Tipos TypeScript derivados para autocompletado y seguridad en tiempo de compilación
export type AllowedInvokeChannel =
  | typeof AUTH_CHANNELS[number]
  | typeof PATIENT_CHANNELS[number]
  | typeof DIAGNOSIS_CHANNELS[number]
  | typeof TREATMENT_CHANNELS[number]
  | typeof USER_CHANNELS[number]
  | typeof HISTORY_CHANNELS[number]
  | typeof ENTRY_CHANNELS[number]
  | typeof LOGGER_CHANNELS[number]
  | typeof APPOINTMENT_CHANNELS[number]
  | typeof PDF_EXPORT_CHANNELS[number]

export type AllowedListenChannel = 'main-process-message'
