import { ipcMain } from "electron";
import { wrapIpcHandler } from '../Configs/Errors/ErrorHandler.js';
import { withAuth } from "../Shared/Middlewares/sessionMiddleware.js";
import appointment from '../Features/appointments/appointment.index.js';
import { APPOINTMENT_CHANNELS } from '../../white-list.js';

export { APPOINTMENT_CHANNELS };

export function appointmentIpc() {
  ipcMain.handle(
    'appointment:create',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: any) => {
        return appointment.createAppointment(data);
      }),
      'appointment:create'
    )
  );

  ipcMain.handle(
    'appointment:getByRange',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: any) => {
        const role = data.sessionClient?.role;
        const userId = data.sessionClient?.userId;

        // Si es PROFESIONAL, forzamos que solo vea su propia agenda a menos que pida explícitamente la general si el negocio lo permite.
        // Si no envía professionalId y el rol es PROFESIONAL, inyectamos su userId.
        if (role === 'PROFESIONAL' && !data.professionalId) {
          data.professionalId = userId;
        }

        return appointment.getAppointmentsByRange(data);
      }),
      'appointment:getByRange'
    )
  );

  ipcMain.handle(
    'appointment:getByPatient',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        return appointment.getAppointmentsByPatient(data);
      }),
      'appointment:getByPatient'
    )
  );

  ipcMain.handle(
    'appointment:updateStatus',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        return appointment.updateAppointmentStatus(data);
      }),
      'appointment:updateStatus'
    )
  );

  ipcMain.handle(
    'appointment:delete',
    wrapIpcHandler(
      withAuth(async (_event: unknown, data: unknown) => {
        return appointment.deleteAppointment(data);
      }),
      'appointment:delete'
    )
  );
}
