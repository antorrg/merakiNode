import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppointmentStore } from './useAppointmentStore';
import { adminApi } from '../../../shared/api/api';

vi.mock('../../../shared/api/api', () => ({
  adminApi: {
    execute: vi.fn(),
  },
}));

vi.mock('../../../shared/components/toast/toastManager', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAppointmentStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppointmentStore.setState({
      appointments: [],
      patientAppointments: [],
      isLoading: false,
      error: null,
      selectedProfessionalId: null,
    });
  });

  it('debería actualizar selectedProfessionalId', () => {
    useAppointmentStore.getState().setSelectedProfessionalId('prof-1');
    expect(useAppointmentStore.getState().selectedProfessionalId).toBe('prof-1');
  });

  it('debería obtener turnos por rango de fechas con fetchAppointmentsByRange', async () => {
    const mockAppointments = [
      { appointmentId: 'app-1', date: '2026-08-10', status: 'PENDING' },
    ];
    vi.mocked(adminApi.execute).mockResolvedValueOnce(mockAppointments as any);

    await useAppointmentStore.getState().fetchAppointmentsByRange('2026-08-01', '2026-08-31', 'prof-1');

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: {
        channel: 'appointment:getByRange',
        payload: { startDate: '2026-08-01', endDate: '2026-08-31', professionalId: 'prof-1' },
      },
      reject: expect.any(Function),
    });
    expect(useAppointmentStore.getState().appointments).toEqual(mockAppointments);
    expect(useAppointmentStore.getState().isLoading).toBe(false);
  });

  it('debería agendar un turno con createAppointment', async () => {
    const newApp = { appointmentId: 'app-2', patientId: 'p-1', professionalId: 'prof-1', date: '2026-08-15' };
    vi.mocked(adminApi.execute).mockResolvedValueOnce(newApp as any);

    const created = await useAppointmentStore.getState().createAppointment({
      patientId: 'p-1',
      professionalId: 'prof-1',
      date: '2026-08-15',
    } as any);

    expect(created).toEqual(newApp);
    expect(adminApi.execute).toHaveBeenCalledWith({
      request: {
        channel: 'appointment:create',
        payload: { patientId: 'p-1', professionalId: 'prof-1', date: '2026-08-15' },
      },
      hasMessage: true,
      successMessage: 'Turno agendado con éxito',
      reject: expect.any(Function),
    });
  });
});
