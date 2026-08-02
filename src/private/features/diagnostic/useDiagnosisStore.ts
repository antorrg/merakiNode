import { create } from 'zustand';
import { IDiagnosis, DiagnosisStatus } from '../../../types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export type DiagnosisCreatePayload = {
  patientId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string | null;
  status?: DiagnosisStatus;
};

export type DiagnosisUpdatePayload = {
  diagnosisId: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string | null;
  status?: DiagnosisStatus;
};

interface DiagnosisState {
  activeDiagnosesByPatient: Record<string, IDiagnosis[]>;
  isLoading: boolean;
  error: string | null;

  fetchActiveDiagnoses: (patientId: string) => Promise<void>;
  createDiagnosis: (payloadOrPatientId: DiagnosisCreatePayload | string, title?: string, status?: DiagnosisStatus) => Promise<IDiagnosis | null>;
  updateDiagnosis: (patientId: string, payload: DiagnosisUpdatePayload) => Promise<IDiagnosis | null>;
  deleteDiagnosis: (patientId: string, diagnosisId: string) => Promise<boolean>;
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
      console.log('estoy en diagnostic: ', response)
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

  createDiagnosis: async (payloadOrPatientId: DiagnosisCreatePayload | string, title?: string, status: DiagnosisStatus = DiagnosisStatus.ACTIVE) => {
    set({ isLoading: true, error: null });
    try {
      let payloadData: DiagnosisCreatePayload;
      if (typeof payloadOrPatientId === 'string') {
        payloadData = {
          patientId: payloadOrPatientId,
          title: title || '',
          status
        };
      } else {
        payloadData = payloadOrPatientId;
      }

      const requestData = {
        patientId: payloadData.patientId,
        title: payloadData.title,
        description: payloadData.description || '',
        startDate: payloadData.startDate || new Date().toLocaleDateString('es-AR'),
        status: payloadData.status || DiagnosisStatus.ACTIVE,
        endDate: payloadData.endDate || null
      };

      const newDiag = await adminApi.execute<IDiagnosis>({
        request: { channel: 'diagnosis:add', payload: requestData },
        hasMessage: true,
        successMessage: 'Diagnóstico creado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      if (newDiag) {
        await get().fetchActiveDiagnoses(payloadData.patientId);
      }
      
      set({ isLoading: false });
      return newDiag || null;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al crear diagnóstico', isLoading: false });
      toast.error(error.message || 'No se pudo crear el diagnóstico');
      return null;
    }
  },

  updateDiagnosis: async (patientId: string, payload: DiagnosisUpdatePayload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDiag = await adminApi.execute<IDiagnosis>({
        request: { channel: 'diagnosis:update', payload },
        hasMessage: true,
        successMessage: 'Diagnóstico actualizado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      await get().fetchActiveDiagnoses(patientId);
      set({ isLoading: false });
      return updatedDiag || null;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al actualizar diagnóstico', isLoading: false });
      toast.error(error.message || 'No se pudo actualizar el diagnóstico');
      return null;
    }
  },

  deleteDiagnosis: async (patientId: string, diagnosisId: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute({
        request: { channel: 'diagnosis:delete', payload: { diagnosisId } },
        hasMessage: true,
        successMessage: 'Diagnóstico eliminado con éxito',
        reject: (err: unknown) => { throw err; }
      });

      await get().fetchActiveDiagnoses(patientId);
      set({ isLoading: false });
      return true;
    } catch (err: unknown) {
      const error = err as Error;
      set({ error: error.message || 'Error al eliminar diagnóstico', isLoading: false });
      toast.error(error.message || 'No se pudo eliminar el diagnóstico');
      return false;
    }
  }
}));
