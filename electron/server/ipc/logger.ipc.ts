import { ipcMain } from 'electron';
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from '../Shared/Middlewares/IpcMiddlewares.js';
import { LoggerServiceSqlite } from '../Configs/Logger/LoggerServiceSqlite.js';
import { LOGGER_CHANNELS } from '../../white-list.js';
import type { IPagesOptions, ILogger, LoggerUpdate } from '../Configs/Logger/Logger.interfaces.js';
import type {
  LoggerGetAllPayload,
  LoggerGetByIdPayload,
  LoggerUpdatePayload,
  LoggerDeletePayload
} from './ipc.types.js';

const service = new LoggerServiceSqlite();

export { LOGGER_CHANNELS };

export function loggerIpc() {
  ipcMain.handle(
    'logs.getAll',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: LoggerGetAllPayload) => {
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
      IpcMiddlewares.withAuth(async (_event: unknown, data: LoggerGetByIdPayload) => {
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
      IpcMiddlewares.withAuth(async (_event: unknown, data: LoggerUpdatePayload) => {
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
      IpcMiddlewares.withAuth(async (_event: unknown, data: LoggerDeletePayload) => {
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
      IpcMiddlewares.withAuth(async () => service.deleteAll(), 'PROPIETARIO'),
      'logs.deleteAll'
    )
  );
}
