import { ipcMain } from "electron";
import { wrapIpcHandler} from '../Configs/Errors/ErrorHandler.js'
import auth from '../Features/auth/auth.index.js'

export function authIpc () {
    ipcMain.handle(
        'auth:login',
        wrapIpcHandler(
            (_event, data)=> auth.login(data),
            'auth:login'
        )
    ),
    ipcMain.handle(
        'auth:getSession',
        wrapIpcHandler(
            (_event, sessionId) => auth.getSession(sessionId),
            'auth:getSession'
        )
    ),  
    ipcMain.handle(
        'auth:logout',
        wrapIpcHandler(
            (_event, sessionId)=> auth.logout(sessionId),
            'auth:logout'
        )
    )
}