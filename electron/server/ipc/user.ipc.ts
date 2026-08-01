import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import user from '../Features/user/user.index.js';
import { USER_CHANNELS } from '../../white-list.js';

export { USER_CHANNELS };

export function userIpc() {
    ipcMain.handle(
        'user:create',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return await user.createUser(data);
            }, 'PROFESIONAL'),
            'user:create'
        )
    );
    ipcMain.handle(
        'users:getAll',
        wrapIpcHandler(
            withAuth(async (_event: unknown) => {//eslint-disable-line
                return await user.getUsers();
            }),
            'users:getAll'
        )
    );
    ipcMain.handle(
        'user:getById',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: string) => {
                return await user.getUserById(data);
            }),
            'user:getById'
        )
    );
    ipcMain.handle(
        'user:updateProfile',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return await user.updateUserProfile(data);
            }),
            'user:updateProfile'
        )
    );
    ipcMain.handle(
        'user:updateStatus',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return await user.updateStatusUser(data);
            }, 'PROFESIONAL'),
            'user:updateStatus'
        )
    );
    ipcMain.handle(
        'user:updatePassword',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return await user.updatePasswordUser(data);
            }),
            'user:updatePassword'
        )
    );
    ipcMain.handle(
        'user:delete',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: string) => {
                return await user.deleteUser(data);
            }, 'PROFESIONAL'),
            'user:delete'
        )
    );
}