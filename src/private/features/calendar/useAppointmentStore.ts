import { create } from 'zustand';
import { IAppointment, CreateAppointmentInput } from '../../../shared/types/appointment.types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export interface AppointmentState {
  appointments: IAppointment[];
  patientAppointments: IAppointment[];
  isLoading: boolean;
  error: string | null;
  selectedProfessionalId: string | null;

  setSelectedProfessionalId: (professionalId: string | null) => void;
  fetchAppointmentsByRange: (startDate: string, endDate: string, professionalId?: string) => Promise<void>;
  fetchPatientAppointments: (patientId: string) => Promise<void>;
  createAppointment: (data: CreateAppointmentInput) => Promise<IAppointment | null>;
  updateAppointmentStatus: (appointmentId: string, status: string, notes?: string) => Promise<void>;
  deleteAppointment: (appointmentId: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  patientAppointments: [],
  isLoading: false,
  error: null,
  selectedProfessionalId: null,

  setSelectedProfessionalId: (professionalId: string | null) => {
    set({ selectedProfessionalId: professionalId });
  },

  fetchAppointmentsByRange: async (startDate: string, endDate: string, professionalId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminApi.execute<IAppointment[]>({
        request: {
          channel: 'appointment:getByRange',
          payload: {
            startDate,
            endDate,
            professionalId: professionalId || get().selectedProfessionalId || undefined
          }
        },
        reject: (err: any) => {
          set({ error: err?.message || 'Error al obtener la agenda de turnos', isLoading: false });
        }
      });

      if (data) {
        set({ appointments: data, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching appointments by range:', err);
      set({ isLoading: false, error: err?.message });
    }
  },

  fetchPatientAppointments: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await adminApi.execute<IAppointment[]>({
        request: {
          channel: 'appointment:getByPatient',
          payload: { patientId }
        },
        reject: (err: any) => {
          set({ error: err?.message || 'Error al obtener turnos del paciente', isLoading: false });
        }
      });

      if (data) {
        set({ patientAppointments: data, isLoading: false });
      }
    } catch (err: any) {
      console.error('Error fetching patient appointments:', err);
      set({ isLoading: false, error: err?.message });
    }
  },

  createAppointment: async (data: CreateAppointmentInput): Promise<IAppointment | null> => {
    set({ isLoading: true, error: null });
    try {
      const created = await adminApi.execute<IAppointment>({
        request: {
          channel: 'appointment:create',
          payload: data
        },
        hasMessage: true,
        successMessage: 'Turno agendado con éxito',
        reject: (err: any) => {
          set({ error: err?.message || 'Error al agendar el turno', isLoading: false });
        }
      });

      set({ isLoading: false });
      return created || null;
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      toast.error(err?.message || 'Error al agendar turno');
      set({ isLoading: false });
      return null;
    }
  },

  updateAppointmentStatus: async (appointmentId: string, status: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute({
        request: {
          channel: 'appointment:updateStatus',
          payload: { appointmentId, status, notes }
        },
        hasMessage: true,
        successMessage: `Estado del turno actualizado a ${status}`,
        reject: (err: any) => {
          set({ error: err?.message || 'Error al actualizar turno', isLoading: false });
          throw err;
        }
      });
      set({ isLoading: false });
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      toast.error(err?.message || 'Error al actualizar el estado del turno');
      set({ isLoading: false });
      throw err;
    }
  },

  deleteAppointment: async (appointmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute({
        request: {
          channel: 'appointment:delete',
          payload: { appointmentId }
        },
        hasMessage: true,
        successMessage: 'Turno eliminado con éxito',
        reject: (err: any) => {
          set({ error: err?.message || 'Error al eliminar el turno', isLoading: false });
          throw err;
        }
      });
      set({ isLoading: false });
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      toast.error(err?.message || 'Error al eliminar turno');
      set({ isLoading: false });
      throw err;
    }
  }
}));
