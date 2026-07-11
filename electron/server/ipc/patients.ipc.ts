import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import patient from '../Features/patients/patient.index.js';

export function patientsIpc() {
    ipcMain.handle(
        'patient:register',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return patient.registerPatient(data);
            }),
            'patient:register'
        )
    );

    ipcMain.handle(
        'patient:getAll',
        wrapIpcHandler(
            withAuth(async (_event: any) => {
                return patient.getPatients();
            }),
            'patient:getAll'
        )
    );

    ipcMain.handle(
        'patient:getById',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return patient.getPatientById(data);
            }),
            'patient:getById'
        )
    );

    ipcMain.handle(
        'patient:updateContact',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return patient.updateContactData(data);
            }),
            'patient:updateContact'
        )
    );
}
