import { ipcMain } from 'electron';
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from '../Shared/Middlewares/IpcMiddlewares.js';
import { backupService } from '../Features/backup/BackupService.js';
import { BACKUP_CHANNELS } from '../../white-list.js';

export { BACKUP_CHANNELS };

export function backupIpc() {
  ipcMain.handle(
    'backup:createManual',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async () => {
        const path = await backupService.createBackup();
        return { success: true, path };
      }),
      'backup:createManual'
    )
  );

  ipcMain.handle(
    'backup:runMaintenance',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async () => {
        const result = backupService.runMaintenance();
        return { success: true, ...result };
      }),
      'backup:runMaintenance'
    )
  );
}
