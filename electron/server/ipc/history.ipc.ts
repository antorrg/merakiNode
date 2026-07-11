import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import history from '../Features/history/history.index.js';

export function historyIpc() {
    ipcMain.handle(
        'history:getFull',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await history.getFullHistory(data);
            }),
            'history:getFull'
        )
    );
}
