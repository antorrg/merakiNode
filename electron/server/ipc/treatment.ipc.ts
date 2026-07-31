import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import treatment from '../Features/treatment/treatment.index.js';

export function treatmentIpc() {
    ipcMain.handle(
        'treatment:add',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return treatment.addTreatment(data);
            }),
            'treatment:add'
        )
    );

    ipcMain.handle(
        'treatment:update',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return treatment.updateTreatment(data);
            }),
            'treatment:update'
        )
    );

    ipcMain.handle(
        'treatment:delete',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return treatment.deleteTreatment(data);
            }),
            'treatment:delete'
        )
    );

    ipcMain.handle(
        'treatment:getByPatient',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return treatment.getTreatmentsByPatient(data);
            }),
            'treatment:getByPatient'
        )
    );
}
