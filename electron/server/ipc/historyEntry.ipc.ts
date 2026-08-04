import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import entry from '../Features/history/historyEntry.index.js';
import type {
  AddHistoryEntryPayload,
  UpdateHistoryEntryPayload,
  DeleteHistoryEntryPayload,
  GetPatientHistoryEntriesPayload
} from "./ipc.types.js";
import { ENTRY_CHANNELS } from '../../white-list.js';

export { ENTRY_CHANNELS };

export function historyEntryIpc() {
    ipcMain.handle(
        'entry:add',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: AddHistoryEntryPayload) => {
                IpcMiddlewares.injectSessionUserId(data, { condition: 'always' });
                return entry.addEntry(data);
            }, 'PROFESIONAL'),
            'entry:add'
        )
    );

    ipcMain.handle(
        'entry:update',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateHistoryEntryPayload) => {
                return entry.updateEntry(data);
            }, 'PROFESIONAL'),
            'entry:update'
        )
    );

    ipcMain.handle(
        'entry:delete',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: DeleteHistoryEntryPayload) => {
                return entry.deleteEntry(data);
            }, 'PROFESIONAL'),
            'entry:delete'
        )
    );

    ipcMain.handle(
        'entry:getByPatient',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetPatientHistoryEntriesPayload) => {
                IpcMiddlewares.injectSessionUserId(data, { condition: 'ifNonOwner' });
                return entry.getPatientEntries(data);
            }, 'PROFESIONAL'),
            'entry:getByPatient'
        )
    );
}
