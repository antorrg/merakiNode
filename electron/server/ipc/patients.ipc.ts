import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import patient from '../Features/patients/patient.index.js';
import { PATIENT_CHANNELS } from '../../white-list.js';

export { PATIENT_CHANNELS };

export function patientsIpc() {
    ipcMain.handle(
        'patient:register',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.registerPatient(data);
            }),
            'patient:register'
        )
    );

    ipcMain.handle(
        'patient:getAll',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.getPatients(data);
            }),
            'patient:getAll'
        )
    );

    ipcMain.handle(
        'patient:getById',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.getPatientById(data);
            }),
            'patient:getById'
        )
    );

    ipcMain.handle(
        'patient:getByIdentityCode',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.getByIdentityCode(data);
            }),
            'patient:getByIdentityCode'
        )
    );

    ipcMain.handle(
        'patient:updateContact',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.updateContactData(data);
            }),
            'patient:updateContact'
        )
    );

    ipcMain.handle(
        'patient:delete',
        wrapIpcHandler(
            withAuth(async (_event: unknown, data: unknown) => {
                return patient.deletePatient(data);
            }, 'PROFESIONAL'),
            'patient:delete'
        )
    );
}
