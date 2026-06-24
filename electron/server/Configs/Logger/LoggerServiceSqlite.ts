import { throwError, processAndThrow } from '../Errors/ErrorHandler.js'
import { type ILogger, type LoggerUpdate, type ILoggerService, type IPagesOptions, type IActionResponse, type IPaginatedResponse } from './Logger.interfaces.js'
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js'
import { db } from '../../Configs/database.js'
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js'
import { Logs } from '../../dbTypes/db.types.js'

export class LoggerServiceSqlite implements ILoggerService<ILogger, LoggerUpdate> {
  protected readonly repo: BaseRepository<Logs, Omit<Logs, 'id'|'created_at'|'updated_at'>, Partial<Logs>>

  constructor () {
    this.repo = new BaseRepository<Logs, Omit<Logs, 'id'|'created_at'|'updated_at'>, Partial<Logs>>('logs', 'id', false, false)
  }

  private readonly parserFn = (row: Logs): ILogger => {
    return {
      id: Number(row.id),
      levelName: row.level_name,
      levelCode: row.level_code ?? 0,
      message: row.message,
      type: row.type ?? null,
      status: row.status ?? null,
      stack: row.stack ?? null,
      contexts: row.contexts ? JSON.parse(row.contexts) : [],
      pid: row.pid,
      time: Number(row.time ?? 0),
      hostname: row.hostname ?? '',
      keep: Boolean(row.keep),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined
    }
  }

  async getAll (options: IPagesOptions<ILogger>): Promise<IPaginatedResponse> {
    try {
      const {
        searchField = '',
        search = null,
        sortBy = 'id',
        order = 'DESC',
        page = 1,
        limit = 10
      } = options

      const offset = (page - 1) * limit

      const whereClause = (search && searchField)
        ? `WHERE ${CaseConverter.toSnakeCase(String(searchField))} LIKE ?`
        : ''

      const params: (string | number)[] = (search && searchField) ? [`%${search}%`] : []

      const countStmt = db.db.prepare(`SELECT COUNT(*) as total FROM logs ${whereClause}`)
      const countRow = countStmt.get(...params) as { total: number } | undefined
      const total = Number(countRow?.total ?? 0)

      const orderSql = (order === 'ASC' ? 'ASC' : 'DESC')
      const sortColumn = CaseConverter.toSnakeCase(String(sortBy))

      const selectStmt = db.db.prepare(`SELECT * FROM logs ${whereClause} ORDER BY ${sortColumn} ${orderSql} LIMIT ? OFFSET ?`)
      const rows = selectStmt.all(...params, limit, offset) as Logs[]

      return {
        info: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        results: rows.map(r => this.parserFn(r))
      }
    } catch (error) {
      return processAndThrow(error, 'Logger getAll')
    }
  }

  async getById (id: number): Promise<ILogger> {
    try {
      const res = this.repo.getById(id).results
      if (!res) throwError(`Log con ID ${id} no encontrado`, 'NOT_FOUND')
      return this.parserFn(res as Logs)
    } catch (error) {
      return processAndThrow(error, 'Logger getById')
    }
  }

  async update (id: number, data: LoggerUpdate): Promise<IActionResponse> {
    try {
      // Map keep directly to the snake_case interface expected by repo.update
      const updated = this.repo.update(id, { keep: data.keep }).results
      if (!updated) throwError(`Log con ID ${id} no encontrado`, 'NOT_FOUND')

      return {
        message: 'Log actualizado correctamente',
        results: this.parserFn(updated as Logs)
      }
    } catch (error) {
      return processAndThrow(error, 'Logger update')
    }
  }

  async delete (id: number): Promise<string> {
    try {
      const result = this.repo.delete(id)
      return result.message
    } catch (error) {
      return processAndThrow(error, 'Logger delete')
    }
  }

  async deleteAll (): Promise<string> {
    try {
      const stmt = db.db.prepare('DELETE FROM logs WHERE keep = 0')
      stmt.run()
      return 'Logs eliminados correctamente'
    } catch (error) {
      return processAndThrow(error, 'Logger deleteAll')
    }
  }
}
