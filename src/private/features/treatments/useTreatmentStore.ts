import { create } from 'zustand';
import { ITreatment } from '../../../types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export type TreatmentCreatePayload = {
  entryId: string;
  name: string;
  description?: string | null;
  frequency?: string | null;
  objective?: string | null;
  startDate: string;
  endDate?: string | null;
};

export type TreatmentUpdatePayload = {
  treatmentId: string;
  name?: string;
  description?: string | null;
  frequency?: string | null;
  objective?: string | null;
  startDate?: string;
  endDate?: string | null;
};

interface TreatmentState {
  treatmentsByPatient: Record<string, ITreatment[]>;
  isLoading: boolean;
  error: string | null;

  fetchTreatmentsByPatient: (patientId: string) => Promise<void>;
  createTreatment: (patientId: string, payload: TreatmentCreatePayload) => Promise<ITreatment | null>;
  updateTreatment: (patientId: string, payload: TreatmentUpdatePayload) => Promise<ITreatment | null>;
  deleteTreatment: (patientId: string, treatmentId: string) => Promise<boolean>;
}

export const useTreatmentStore = create<TreatmentState>((set, get) => ({
  treatmentsByPatient: {},
  isLoading: false,
  error: null,

  fetchTreatmentsByPatient: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.execute<ITreatment[]>({
        request: { channel: 'treatment:getByPatient', payload: { patientId } },
        reject: (err: unknown) => { throw err; }
      });

      set((state) => ({
        treatmentsByPatient: {
          ...state.treatmentsByPatient,
          [patientId]: response || []
        },
        isLoading: false
      }));
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al obtener tratamientos', isLoading: false });
    }
  },

  createTreatment: async (patientId: string, payload: TreatmentCreatePayload) => {
    set({ isLoading: true, error: null });
    try {
      const newTreatment = await adminApi.execute<ITreatment>({
        request: { channel: 'treatment:add', payload },
        hasMessage: true,
        successMessage: 'Tratamiento creado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      if (newTreatment) {
        await get().fetchTreatmentsByPatient(patientId);
      }

      set({ isLoading: false });
      return newTreatment || null;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al crear tratamiento', isLoading: false });
      toast.error(error.message || 'No se pudo crear el tratamiento');
      return null;
    }
  },

  updateTreatment: async (patientId: string, payload: TreatmentUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTreatment = await adminApi.execute<ITreatment>({
        request: { channel: 'treatment:update', payload },
        hasMessage: true,
        successMessage: 'Tratamiento actualizado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      await get().fetchTreatmentsByPatient(patientId);
      set({ isLoading: false });
      return updatedTreatment || null;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al actualizar tratamiento', isLoading: false });
      toast.error(error.message || 'No se pudo actualizar el tratamiento');
      return null;
    }
  },

  deleteTreatment: async (patientId: string, treatmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute({
        request: { channel: 'treatment:delete', payload: { treatmentId } },
        hasMessage: true,
        successMessage: 'Tratamiento eliminado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      await get().fetchTreatmentsByPatient(patientId);
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al eliminar tratamiento', isLoading: false });
      toast.error(error.message || 'No se pudo eliminar el tratamiento');
      return false;
    }
  }
}));
