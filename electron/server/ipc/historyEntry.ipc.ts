import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import entry from '../Features/history/historyEntry.index.js';

export function historyEntryIpc() {
    ipcMain.handle(
        'entry:add',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                // Inyectar el professionalId directamente desde la sesión para máxima seguridad
                // Así el Frontend no puede falsificar quién firmó la evolución.
                if (data.sessionClient && data.sessionClient.userId) {
                    data.professionalId = data.sessionClient.userId;
                }
                return entry.addEntry(data);
            }),
            'entry:add'
        )
    );

    ipcMain.handle(
        'entry:update',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return entry.updateEntry(data);
            }),
            'entry:update'
        )
    );

    ipcMain.handle(
        'entry:delete',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return entry.deleteEntry(data);
            }),
            'entry:delete'
        )
    );
}
