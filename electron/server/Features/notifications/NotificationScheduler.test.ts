import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { NotificationScheduler } from './NotificationScheduler.js';
import { AppointmentRepository } from '../appointments/AppointmentRepository.js';

describe('NotificationScheduler', () => {
  let mockRepository: Partial<AppointmentRepository>;
  let scheduler: NotificationScheduler;

  beforeEach(() => {
    mockRepository = {
      getByDateRange: vi.fn().mockReturnValue([])
    };
    scheduler = new NotificationScheduler(mockRepository as AppointmentRepository, 1000);
  });

  it('debe detectar inicio de turno dentro del margen de 60 segundos', () => {
    const now = dayjs('2026-08-05T10:00:00.000Z');
    
    mockRepository.getByDateRange = vi.fn().mockReturnValue([
      {
        appointmentId: 'app-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        service: 'Consulta Kinesiología',
        status: 'CONFIRMED',
        startTime: '2026-08-05T10:00:15.000Z', // 15s después de la hora actual
        endTime: '2026-08-05T11:00:00.000Z',
        createdBy: 'prof-1',
        patientName: 'Carlos López'
      }
    ]);

    const dispatchSpy = vi.spyOn(scheduler as any, 'dispatchNotification'); //eslint-disable-line @typescript-eslint/no-explicit-any

    scheduler.checkUpcomingAppointments(now);

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'START',
      appointmentId: 'app-1',
      patientName: 'Carlos López',
      service: 'Consulta Kinesiología'
    }));
  });

  it('no debe duplicar notificaciones para el mismo turno en ejecuciones consecutivas', () => {
    const now = dayjs('2026-08-05T10:00:00.000Z');

    mockRepository.getByDateRange = vi.fn().mockReturnValue([
      {
        appointmentId: 'app-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        service: 'Consulta Kinesiología',
        status: 'CONFIRMED',
        startTime: '2026-08-05T10:00:00.000Z',
        endTime: '2026-08-05T11:00:00.000Z',
        createdBy: 'prof-1',
        patientName: 'Carlos López'
      }
    ]);

    const dispatchSpy = vi.spyOn(scheduler as any, 'dispatchNotification'); //eslint-disable-line @typescript-eslint/no-explicit-any

    // Primera verificación
    scheduler.checkUpcomingAppointments(now);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    // Segunda verificación (mismo momento)
    scheduler.checkUpcomingAppointments(now);
    expect(dispatchSpy).toHaveBeenCalledTimes(1); // No vuelve a llamarlo
  });

  it('debe ignorar turnos cancelados', () => {
    const now = dayjs('2026-08-05T10:00:00.000Z');

    mockRepository.getByDateRange = vi.fn().mockReturnValue([
      {
        appointmentId: 'app-2',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        service: 'Consulta Kinesiología',
        status: 'CANCELLED',
        startTime: '2026-08-05T10:00:00.000Z',
        endTime: '2026-08-05T11:00:00.000Z',
        createdBy: 'prof-1',
        patientName: 'Ana Gómez'
      }
    ]);

    const dispatchSpy = vi.spyOn(scheduler as any, 'dispatchNotification'); //eslint-disable-line @typescript-eslint/no-explicit-any

    scheduler.checkUpcomingAppointments(now);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
