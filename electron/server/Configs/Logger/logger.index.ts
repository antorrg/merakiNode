import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/logger.schema.js';
import { LoggerServiceSqlite } from './LoggerServiceSqlite.js';
import type { IPagesOptions, ILogger } from './Logger.interfaces.js';

const loggerService = new LoggerServiceSqlite();

export default {
  getLogs: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.getLogsSchema) as IPagesOptions<ILogger>;
    return loggerService.getAll(validData);
  },

  getLogById: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.getLogByIdSchema) as { id: number };
    return loggerService.getById(validData.id);
  },

  updateLog: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateLogSchema) as { id: number, keep: boolean };
    const { id, keep } = validData;
    return loggerService.update(id, { keep });
  },

  deleteLog: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteLogSchema) as { id: number };
    return loggerService.delete(validData.id);
  },

  deleteAllLogs: () => {
    return loggerService.deleteAll();
  }
};
