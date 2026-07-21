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
            withAuth(async (_event: any, data: any) => {
                return patient.getPatients(data);
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

    ipcMain.handle(
        'patient:delete',
        wrapIpcHandler(
            withAuth(async (_event: any, data: any) => {
                return patient.deletePatient(data);
            }),
            'patient:delete'
        )
    );
}
