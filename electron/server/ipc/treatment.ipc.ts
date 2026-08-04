import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import treatment from '../Features/treatment/treatment.index.js';
import type {
  AddTreatmentPayload,
  UpdateTreatmentPayload,
  DeleteTreatmentPayload,
  GetTreatmentsByPatientPayload
} from "./ipc.types.js";
import { TREATMENT_CHANNELS } from '../../white-list.js';

export { TREATMENT_CHANNELS };

export function treatmentIpc() {
    ipcMain.handle(
        'treatment:add',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: AddTreatmentPayload) => {
                return treatment.addTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:add'
        )
    );

    ipcMain.handle(
        'treatment:update',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateTreatmentPayload) => {
                return treatment.updateTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:update'
        )
    );

    ipcMain.handle(
        'treatment:delete',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: DeleteTreatmentPayload) => {
                return treatment.deleteTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:delete'
        )
    );

    ipcMain.handle(
        'treatment:getByPatient',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetTreatmentsByPatientPayload) => {
                return treatment.getTreatmentsByPatient(data);
            }, 'PROFESIONAL'),
            'treatment:getByPatient'
        )
    );
}
