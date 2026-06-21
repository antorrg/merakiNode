import { ipcMain } from "electron";
import { wrapIpcHandler} from '../Configs/Errors/ErrorHandler.js'
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import user from '../Features/user/user.index.js'

export function userIpc (){
    ipcMain.handle(
        'user:create',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                // withAuth inyecta sessionClient en data, pero pasamos data a createUser
                return await user.createUser(data);
            }, 'ADMIN'), // Si quieres restringir crear usuarios solo a ADMIN, pásalo aquí.
            'user:create'
        )
    ),
    ipcMain.handle(
        'users.getAll',
        wrapIpcHandler(
            withAuth(async (_event: any)=> {
                return await user.getUsers()
            }),
            'user:getAll'
        )
    )
}