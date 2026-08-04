import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import user from '../Features/user/user.index.js';
import type {
  CreateUserPayload,
  GetUserByIdPayload,
  UpdateUserProfilePayload,
  UpdateUserStatusPayload,
  UpdateUserPasswordPayload,
  DeleteUserPayload
} from "./ipc.types.js";
import { USER_CHANNELS } from '../../white-list.js';

export { USER_CHANNELS };

export function userIpc() {
    ipcMain.handle(
        'user:create',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: CreateUserPayload) => {
                return await user.createUser(data);
            }, 'PROFESIONAL'),
            'user:create'
        )
    );
    ipcMain.handle(
        'users:getAll',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async () => {
                return await user.getUsers();
            }),
            'users:getAll'
        )
    );
    ipcMain.handle(
        'user:getById',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetUserByIdPayload) => {
                return await user.getUserById(data);
            }),
            'user:getById'
        )
    );
    ipcMain.handle(
        'user:updateProfile',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateUserProfilePayload) => {
                
                return await user.updateUserProfile(IpcMiddlewares.selfGuard(data));
            }),
            'user:updateProfile'
        )
    );
    ipcMain.handle(
        'user:updateStatus',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateUserStatusPayload) => {
                return await user.updateStatusUser(data);
            }, 'PROFESIONAL'),
            'user:updateStatus'
        )
    );
    ipcMain.handle(
        'user:updatePassword',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateUserPasswordPayload) => {
                IpcMiddlewares.selfGuard(data);
                return await user.updatePasswordUser(data);
            }),
            'user:updatePassword'
        )
    );
    ipcMain.handle(
        'user:delete',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: DeleteUserPayload) => {
                return await user.deleteUser(data as unknown as string);
            }, 'PROFESIONAL'),
            'user:delete'
        )
    );
}