import { BrowserWindow, Notification } from 'electron';
import dayjs from 'dayjs';
import { AppointmentRepository } from '../appointments/AppointmentRepository.js';

export interface NotificationPayload {
  type: 'START' | 'END';
  appointmentId: string;
  patientName: string;
  service: string;
  startTime: string;
  endTime: string;
}

export class NotificationScheduler {
  private repository: AppointmentRepository;
  private intervalId: NodeJS.Timeout | null = null;
  private notifiedSet: Set<string> = new Set();
  private checkIntervalMs: number;

  constructor(repository: AppointmentRepository, checkIntervalMs: number = 30000) {
    this.repository = repository;
    this.checkIntervalMs = checkIntervalMs;
  }

  public start(): void {
    if (this.intervalId) return;

    // Ejecutar verificación inicial
    this.checkUpcomingAppointments();

    // Programar verificación periódica
    this.intervalId = setInterval(() => {
      this.checkUpcomingAppointments();
    }, this.checkIntervalMs);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public checkUpcomingAppointments(customNow?: dayjs.Dayjs): void {
    try {
      const now = customNow || dayjs();
      const startOfDay = now.startOf('day').toISOString();
      const endOfDay = now.endOf('day').toISOString();

      const appointments = this.repository.getByDateRange(startOfDay, endOfDay);

      for (const app of appointments) {
        if (app.status === 'CANCELLED') continue;

        const appStart = dayjs(app.startTime);
        const appEnd = dayjs(app.endTime);

        // Diferencia en segundos entre la hora actual y el inicio/fin del turno
        const diffStartSec = now.diff(appStart, 'second');
        const diffEndSec = now.diff(appEnd, 'second');

        // Notificar inicio si está dentro de una ventana de ±60 segundos y no fue notificado
        const startKey = `start_${app.appointmentId}`;
        if (Math.abs(diffStartSec) <= 60 && !this.notifiedSet.has(startKey)) {
          this.notifiedSet.add(startKey);
          this.dispatchNotification({
            type: 'START',
            appointmentId: app.appointmentId,
            patientName: app.patientName || 'Paciente',
            service: app.service,
            startTime: app.startTime,
            endTime: app.endTime
          });
        }

        // Notificar fin si está dentro de una ventana de ±60 segundos y no fue notificado
        const endKey = `end_${app.appointmentId}`;
        if (Math.abs(diffEndSec) <= 60 && !this.notifiedSet.has(endKey)) {
          this.notifiedSet.add(endKey);
          this.dispatchNotification({
            type: 'END',
            appointmentId: app.appointmentId,
            patientName: app.patientName || 'Paciente',
            service: app.service,
            startTime: app.startTime,
            endTime: app.endTime
          });
        }
      }
    } catch (error) {
      console.error('[NotificationScheduler] Error al verificar turnos:', error);
    }
  }

  private dispatchNotification(payload: NotificationPayload): void {
    const isStart = payload.type === 'START';
    const title = isStart ? '🟢 ¡Turno Iniciado!' : '🔴 ¡Turno Finalizado!';
    const body = isStart
      ? `Ha comenzado el turno de ${payload.service} con ${payload.patientName}.`
      : `Ha finalizado el turno de ${payload.service} con ${payload.patientName}.`;

    // 1. Notificación Nativa del Sistema Operativo
    try {
      if (typeof Notification !== 'undefined' && Notification.isSupported()) {
        const notif = new Notification({
          title,
          body,
          silent: false
        });
        notif.show();
      }
    } catch (err) {
      console.warn('[NotificationScheduler] No se pudo mostrar la notificación nativa del SO:', err);
    }

    // 2. Notificación vía IPC al Frontend
    try {
      if (typeof BrowserWindow !== 'undefined') {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
          if (!win.isDestroyed()) {
            win.webContents.send('appointment:notification', {
              ...payload,
              title,
              body
            });
          }
        }
      }
    } catch (err) {
      console.warn('[NotificationScheduler] No se pudo emitir el mensaje IPC:', err);
    }
  }
}
