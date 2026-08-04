import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import history from '../Features/history/history.index.js';
import type { GetFullHistoryPayload } from "./ipc.types.js";
import { HISTORY_CHANNELS } from '../../white-list.js';

export { HISTORY_CHANNELS };

export function historyIpc() {
    ipcMain.handle(
        'history:getFull',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetFullHistoryPayload) => { 
               const response = await history.getFullHistory(data);
               return response;
            }, 'PROFESIONAL'),
            'history:getFull'
        )
    );
}
