import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import diagnosis from '../Features/diagnosis/diagnosis.index.js';

export function diagnosisIpc() {
    ipcMain.handle(
        'diagnosis:add',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return diagnosis.addDiagnosisToPatient(data);
            }),
            'diagnosis:add'
        )
    );

    ipcMain.handle(
        'diagnosis:getActive',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return diagnosis.getActiveDiagnoses(data);
            }),
            'diagnosis:getActive'
        )
    );

    ipcMain.handle(
        'diagnosis:update',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return diagnosis.updateDiagnosis(data);
            }),
            'diagnosis:update'
        )
    );

    ipcMain.handle(
        'diagnosis:delete',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return diagnosis.deleteDiagnosis(data);
            }),
            'diagnosis:delete'
        )
    );
}
