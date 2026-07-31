import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import entry from '../Features/history/historyEntry.index.js';
import { ENTRY_CHANNELS } from '../../white-list.js';

export { ENTRY_CHANNELS };

export function historyEntryIpc() {
    ipcMain.handle(
        'entry:add',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: any) => {//eslint-disable-line
                if (data.sessionClient && data.sessionClient.userId) {
                    data.professionalId = data.sessionClient.userId;
                }
                return entry.addEntry(data);
            }, 'PROFESIONAL'),
            'entry:add'
        )
    );

    ipcMain.handle(
        'entry:update',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return entry.updateEntry(data);
            }, 'PROFESIONAL'),
            'entry:update'
        )
    );

    ipcMain.handle(
        'entry:delete',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return entry.deleteEntry(data);
            }, 'PROFESIONAL'),
            'entry:delete'
        )
    );

    ipcMain.handle(
        'entry:getByPatient',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: any) => {//eslint-disable-line
                const role = data.sessionClient?.role;
                const userId = data.sessionClient?.userId;
                
                if (role !== 'PROPIETARIO') {
                    data.professionalId = userId;
                }
                
                return entry.getPatientEntries(data);
            }, 'PROFESIONAL'),
            'entry:getByPatient'
        )
    );
}
