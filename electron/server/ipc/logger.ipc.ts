import { ipcMain } from 'electron';
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from '../Shared/Middlewares/sessionMiddleware.js';
import { LoggerServiceSqlite } from '../Configs/Logger/LoggerServiceSqlite.js';
import { LOGGER_CHANNELS } from '../../white-list.js';
import type { IPagesOptions, ILogger, LoggerUpdate } from '../Configs/Logger/Logger.interfaces.js';

const service = new LoggerServiceSqlite();

export { LOGGER_CHANNELS };

export function loggerIpc() {
  ipcMain.handle(
    'logs.getAll',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        const payload = (data ?? {}) as Record<string, unknown>;
        const query = (payload.query ?? payload) as IPagesOptions<ILogger>;
        return service.getAll(query);
      }, 'PROPIETARIO'),
      'logs.getAll'
    )
  );

  ipcMain.handle(
    'logs.getById',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        const payload = (data ?? {}) as Record<string, unknown>;
        const id = payload.id ?? payload;
        return service.getById(Number(id));
      }, 'PROPIETARIO'),
      'logs.getById'
    )
  );

  ipcMain.handle(
    'logs.update',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        const payload = (data ?? {}) as Record<string, unknown>;
        const id = payload.id;
        const updateData = (payload.data ?? payload) as LoggerUpdate;
        return service.update(Number(id), updateData);
      }, 'PROPIETARIO'),
      'logs.update'
    )
  );

  ipcMain.handle(
    'logs.delete',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        const payload = (data ?? {}) as Record<string, unknown>;
        const id = payload.id ?? payload;
        return service.delete(Number(id));
      }, 'PROPIETARIO'),
      'logs.delete'
    )
  );

  ipcMain.handle(
    'logs.deleteAll',
    wrapIpcHandler(
      withAuth(async () => service.deleteAll(), 'PROPIETARIO'),
      'logs.deleteAll'
    )
  );
}
