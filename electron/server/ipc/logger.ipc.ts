import { ipcMain } from 'electron'
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js'
import { LoggerServiceSqlite } from '../Configs/Logger/LoggerServiceSqlite.js'

const service = new LoggerServiceSqlite()

export function loggerIpc () {
  ipcMain.handle(
    'logs.getAll',
    wrapIpcHandler(
      async (_event, query) => service.getAll(query ?? {}),
      'logs.getAll'
    )
  )

  ipcMain.handle(
    'logs.getById',
    wrapIpcHandler(
      async (_event, id) => service.getById(Number(id)),
      'logs.getById'
    )
  )

  ipcMain.handle(
    'logs.update',
    wrapIpcHandler(
      async (_event, { id, data }) => service.update(Number(id), data),
      'logs.update'
    )
  )

  ipcMain.handle(
    'logs.delete',
    wrapIpcHandler(
      async (_event, id) => service.delete(Number(id)),
      'logs.delete'
    )
  )

  ipcMain.handle(
    'logs.deleteAll',
    wrapIpcHandler(
      async () => service.deleteAll(),
      'logs.deleteAll'
    )
  )
}
