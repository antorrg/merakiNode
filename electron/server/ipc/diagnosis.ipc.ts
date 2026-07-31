import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import diagnosis from '../Features/diagnosis/diagnosis.index.js';
import { DIAGNOSIS_CHANNELS } from '../../white-list.js';

export { DIAGNOSIS_CHANNELS };

export function diagnosisIpc() {
    ipcMain.handle(
        'diagnosis:add',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return diagnosis.addDiagnosisToPatient(data);
            }, 'PROFESIONAL'),
            'diagnosis:add'
        )
    );

    ipcMain.handle(
        'diagnosis:getActive',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return diagnosis.getActiveDiagnoses(data);
            }, 'PROFESIONAL'),
            'diagnosis:getActive'
        )
    );

    ipcMain.handle(
        'diagnosis:update',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return diagnosis.updateDiagnosis(data);
            }, 'PROFESIONAL'),
            'diagnosis:update'
        )
    );

    ipcMain.handle(
        'diagnosis:delete',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return diagnosis.deleteDiagnosis(data);
            }),
            'diagnosis:delete'
        )
    );
}
