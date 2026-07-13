import { ipcMain } from "electron";
import { wrapIpcHandler} from '../Configs/Errors/ErrorHandler.js'
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import user from '../Features/user/user.index.js'

export function userIpc (){
    ipcMain.handle(
        'user:create',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await user.createUser(data);
            }, 'ADMIN'),
            'user:create'
        )
    );
    ipcMain.handle(
        'users.getAll',
        wrapIpcHandler(
            withAuth(async (_event: any)=> {
                return await user.getUsers()
            }),
            'users:getAll'
        )
    );
    ipcMain.handle(
        'user:getById',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await user.getUserById(data.userId);
            }),
            'user:getById'
        )
    );
    ipcMain.handle(
        'user:updateProfile',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await user.updateUserProfile(data);
            }, 'ADMIN'), 
            'user:updateProfile'
        )
    );
    ipcMain.handle(
        'user:updateStatus',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await user.updateStatusUser(data);
            }, 'ADMIN'),
            'user:updateStatus'
        )
    );
    ipcMain.handle(
        'user:updatePassword',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return await user.updatePasswordUser(data);
            }), 
            'user:updatePassword'
        )
    );
}