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
      //eslint-disable-next-line
      IpcMiddlewares.withAuth(async (_event: unknown, _data: GetConfigPayload) => {
        return configService.getConfig();
      }),
      'config:get'
    )
  );

  ipcMain.handle(
    'brand:get',
    wrapIpcHandler(async () => {
      const cfg = configService.getConfig();
      const logo = (cfg.logoUrl && cfg.logoUrl.startsWith('data:image'))
        ? cfg.logoUrl
        : (cfg.pdf?.logoUrl && cfg.pdf.logoUrl.startsWith('data:image'))
          ? cfg.pdf.logoUrl
          : (cfg.logoUrl && cfg.logoUrl !== '/medicalLogo.png'
            ? cfg.logoUrl
            : (cfg.pdf?.logoUrl && cfg.pdf.logoUrl !== '/medicalLogo.png'
              ? cfg.pdf.logoUrl
              : null));

      return {
        appName: cfg.appName || cfg.pdf?.institutionName || 'Espacio Medico Integral',
        shortName: cfg.shortName || 'Medical',
        legalName: cfg.legalName || cfg.appName || 'Espacio Medico Integral ',
        logoUrl: logo,
        phone: cfg.phone || '',
        email: cfg.email || '',
        address: cfg.address || '',
        customHeaderNotes: cfg.customHeaderNotes || cfg.pdf?.customHeaderNotes || '',
      };
    }, 'brand:get')
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
