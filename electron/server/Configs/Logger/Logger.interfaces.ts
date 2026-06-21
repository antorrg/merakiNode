export interface ILogger {
  id: number
  levelName: string
  levelCode: number
  message: string
  type?: string | null
  status?: number | null
  stack?: string | null
  contexts?: string[] | []
  pid: number
  time: number
  hostname: string
  keep: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoggerCreate {
  level: string
  message: string
  data?: Record<string, any> | null
}

export type LoggerUpdate = Pick<ILogger, 'keep'>

interface IPagesInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IPaginatedResponse {
  info: IPagesInfo
  results: ILogger[]
}

export type OrderDirection = 'ASC' | 'DESC'

export interface Order<T> {
  field: keyof T
  direction: OrderDirection
}

export interface IPagesOptions<T> {
  searchField?: keyof T
  search?: unknown
  page?: number
  limit?: number
  sortBy?: keyof T
  order?: OrderDirection
}

export interface IActionResponse {
  message: string
  results: ILogger
}

export interface ILoggerService<TLog, TLogUpdate> {
  getAll: (options: IPagesOptions<TLog>) => Promise<IPaginatedResponse>
  getById: (id: number) => Promise<TLog>
  update: (id: number, data: TLogUpdate) => Promise<IActionResponse>
  delete: (id: number) => Promise<string>
  deleteAll: () => Promise<string>
}
/*
const normalizedLog = {
  levelName: levelToText(log.level),
  levelCode: log.level,
  message: log.msg,
  type: log.err?.type ?? null,     // 👈 Aquí
  status: log.err?.status ?? null,
  stack: log.err?.stack ?? null,
  contexts: log.err?.contexts ?? [],
  pid: log.pid,
  time:log.time,
  hostname: log.hostname
};
*/