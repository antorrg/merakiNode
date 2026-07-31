import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import treatment from '../Features/treatment/treatment.index.js';
import { TREATMENT_CHANNELS } from '../../white-list.js';

export { TREATMENT_CHANNELS };

export function treatmentIpc() {
    ipcMain.handle(
        'treatment:add',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return treatment.addTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:add'
        )
    );

    ipcMain.handle(
        'treatment:update',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return treatment.updateTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:update'
        )
    );

    ipcMain.handle(
        'treatment:delete',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return treatment.deleteTreatment(data);
            }, 'PROFESIONAL'),
            'treatment:delete'
        )
    );

    ipcMain.handle(
        'treatment:getByPatient',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return treatment.getTreatmentsByPatient(data);
            }, 'PROFESIONAL'),
            'treatment:getByPatient'
        )
    );
}
