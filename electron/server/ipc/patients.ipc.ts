import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import patient from '../Features/patients/patient.index.js';
import type {
  RegisterPatientPayload,
  GetPatientsPayload,
  GetPatientByIdPayload,
  GetByIdentityCodePayload,
  UpdatePatientContactPayload,
  DeletePatientPayload
} from "./ipc.types.js";
import { PATIENT_CHANNELS } from '../../white-list.js';

export { PATIENT_CHANNELS };

export function patientsIpc() {
    ipcMain.handle(
        'patient:register',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: RegisterPatientPayload) => {
                return patient.registerPatient(data);
            }),
            'patient:register'
        )
    );

    ipcMain.handle(
        'patient:getAll',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetPatientsPayload) => {
                return patient.getPatients(data);
            }),
            'patient:getAll'
        )
    );

    ipcMain.handle(
        'patient:getById',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetPatientByIdPayload) => {
                return patient.getPatientById(data);
            }),
            'patient:getById'
        )
    );

    ipcMain.handle(
        'patient:getByIdentityCode',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: GetByIdentityCodePayload) => {
                return patient.getByIdentityCode(data);
            }),
            'patient:getByIdentityCode'
        )
    );

    ipcMain.handle(
        'patient:updateContact',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: UpdatePatientContactPayload) => {
                return patient.updateContactData(data);
            }),
            'patient:updateContact'
        )
    );

    ipcMain.handle(
        'patient:delete',
        wrapIpcHandler(
            IpcMiddlewares.withAuth(async (_event: unknown, data: DeletePatientPayload) => {
                return patient.deletePatient(data);
            }, 'PROFESIONAL'),
            'patient:delete'
        )
    );
}
