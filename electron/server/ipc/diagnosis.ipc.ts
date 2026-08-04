import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import diagnosis from '../Features/diagnosis/diagnosis.index.js';
import type {
  AddDiagnosisPayload,
  GetActiveDiagnosesPayload,
  UpdateDiagnosisPayload,
  DeleteDiagnosisPayload
} from "./ipc.types.js";
import { DIAGNOSIS_CHANNELS } from '../../white-list.js';

export { DIAGNOSIS_CHANNELS };

export function diagnosisIpc() {
    ipcMain.handle(
        'diagnosis:add',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: AddDiagnosisPayload) => {
                return diagnosis.addDiagnosisToPatient(data);
            }, 'PROFESIONAL'),
            'diagnosis:add'
        )
    );

    ipcMain.handle(
        'diagnosis:getActive',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetActiveDiagnosesPayload) => {
                return diagnosis.getActiveDiagnoses(data);
            }, 'PROFESIONAL'),
            'diagnosis:getActive'
        )
    );

    ipcMain.handle(
        'diagnosis:update',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateDiagnosisPayload) => {
                return diagnosis.updateDiagnosis(data);
            }, 'PROFESIONAL'),
            'diagnosis:update'
        )
    );

    ipcMain.handle(
        'diagnosis:delete',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: DeleteDiagnosisPayload) => {
                return diagnosis.deleteDiagnosis(data);
            }, 'PROFESIONAL'),
            'diagnosis:delete'
        )
    );
}
