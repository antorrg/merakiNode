import { create } from 'zustand';
import { IDiagnosis, DiagnosisStatus } from '../../../shared/types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export type DiagnosisCreate = Omit<IDiagnosis, 'diagnosisId'>;

interface DiagnosisState {
  activeDiagnosesByPatient: Record<string, IDiagnosis[]>;
  isLoading: boolean;
  error: string | null;

  fetchActiveDiagnoses: (patientId: string) => Promise<void>;
  createDiagnosis: (patientId: string, title: string, status?: DiagnosisStatus) => Promise<IDiagnosis | null>;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  activeDiagnosesByPatient: {},
  isLoading: false,
  error: null,

  fetchActiveDiagnoses: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.execute<IDiagnosis[]>({
        request: { channel: 'diagnosis:getActive', payload: { patientId } },
        reject: (err: unknown) => { throw err; }
      });
      
      if (!response) throw new Error('Respuesta vacía del servidor');
      
      set((state) => ({
        activeDiagnosesByPatient: {
          ...state.activeDiagnosesByPatient,
          [patientId]: response
        },
        isLoading: false
      }));
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al obtener diagnósticos', isLoading: false });
    }
  },

  createDiagnosis: async (patientId: string, title: string, status: DiagnosisStatus = DiagnosisStatus.ACTIVE) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        patientId,
        title,
        description: '',
        startDate: new Date().toISOString(),
        status
      };

      const newDiag = await adminApi.execute<IDiagnosis>({
        request: { channel: 'diagnosis:add', payload },
        hasMessage: true,
        successMessage: 'Diagnóstico creado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      if (newDiag) {
        // Refetch active diagnoses
        await get().fetchActiveDiagnoses(patientId);
      }
      
      set({ isLoading: false });
      return newDiag || null;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al crear diagnóstico', isLoading: false });
      toast.error(error.message || 'No se pudo crear el diagnóstico');
      return null;
    }
  }
}));
