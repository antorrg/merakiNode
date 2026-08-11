import { ipcMain } from 'electron';
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from '../Shared/Middlewares/IpcMiddlewares.js';
import { configService } from '../Features/configuration/ConfigService.js';
import type { GetConfigPayload, SaveConfigPayload } from './ipc.types.js';
import { CONFIG_CHANNELS } from '../../white-list.js';

export { CONFIG_CHANNELS };

export function configIpc() {
  ipcMain.handle(
    'config:get',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, _data: GetConfigPayload) => {
        return configService.getConfig();
      }),
      'config:get'
    )
  );

  ipcMain.handle(
    'config:save',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: SaveConfigPayload) => {
        return configService.saveConfig(data.config || {});
      }),
      'config:save'
    )
  );
}
