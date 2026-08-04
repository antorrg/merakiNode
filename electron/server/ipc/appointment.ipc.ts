import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { IpcMiddlewares } from "../Shared/Middlewares/IpcMiddlewares.js";
import appointment from '../Features/appointments/appointment.index.js';
import type {
  CreateAppointmentPayload,
  GetAppointmentsByRangePayload,
  GetAppointmentsByPatientPayload,
  UpdateAppointmentStatusPayload,
  DeleteAppointmentPayload
} from "./ipc.types.js";
import { APPOINTMENT_CHANNELS } from '../../white-list.js';

export { APPOINTMENT_CHANNELS };

export function appointmentIpc() {
  ipcMain.handle(
    'appointment:create',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: CreateAppointmentPayload) => {
        return appointment.createAppointment(data);
      }),
      'appointment:create'
    )
  );

  ipcMain.handle(
    'appointment:getByRange',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: GetAppointmentsByRangePayload) => {
        IpcMiddlewares.injectSessionUserId(data, { condition: 'ifRole', role: 'PROFESIONAL' });
        return appointment.getAppointmentsByRange(data);
      }),
      'appointment:getByRange'
    )
  );

  ipcMain.handle(
    'appointment:getByPatient',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: GetAppointmentsByPatientPayload) => {
        return appointment.getAppointmentsByPatient(data);
      }),
      'appointment:getByPatient'
    )
  );

  ipcMain.handle(
    'appointment:updateStatus',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: UpdateAppointmentStatusPayload) => {
        return appointment.updateAppointmentStatus(data);
      }),
      'appointment:updateStatus'
    )
  );

  ipcMain.handle(
    'appointment:delete',
    wrapIpcHandler(
      IpcMiddlewares.withAuth(async (_event: unknown, data: DeleteAppointmentPayload) => {
        return appointment.deleteAppointment(data);
      }),
      'appointment:delete'
    )
  );
}
