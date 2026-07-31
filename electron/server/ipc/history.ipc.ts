import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import history from '../Features/history/history.index.js';
import { HISTORY_CHANNELS } from '../../white-list.js';

export { HISTORY_CHANNELS };

export function historyIpc() {
    ipcMain.handle(
        'history:getFull',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => { 
               const response = await history.getFullHistory(data);
               return response;
            }, 'PROFESIONAL'),
            'history:getFull'
        )
    );
}
