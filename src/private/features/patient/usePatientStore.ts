import { create } from 'zustand';
import { IPatient } from '../../../types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ApiResponse<T> {
  data: T;
  info?: PaginationInfo;
}

export type CreatePatientPayload = Omit<IPatient, 'patientId' | 'age'>;
export type UpdatePatientContactPayload = {
  firstName?: string;
  lastName?: string;
  typeDoc?: string;
  identityCode?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  [key: string]: unknown;
};

interface ApiError extends Error {
  message: string;
  code?: string;
}

export interface PatientState {
  patients: IPatient[];
  patientDetail: IPatient | null;
  info: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  fetchPatients: (page?: number, limit?: number, search?: string) => Promise<void>;
  createPatient: (data: CreatePatientPayload) => Promise<IPatient>;
  updatePatientContact: (patientId: string, data: UpdatePatientContactPayload) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  getPatientById: (patientId: string) => Promise<IPatient>;
  getPatientByIdentityCode: (identityCode: string) => Promise<IPatient | null>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  patientDetail: null,
  info: null,
  isLoading: false,
  error: null,
  searchTerm: '',

  setSearchTerm: (searchTerm: string) => set({ searchTerm }),

  fetchPatients: async (page = 1, limit = 5, search?: string) => {
    set({ isLoading: true, error: null });
    
    const activeSearch = search !== undefined ? search : get().searchTerm;
    if (search !== undefined) {
      set({ searchTerm: search });
    }

    try {
      const response = await adminApi.execute<ApiResponse<IPatient[]>>({
        request: { channel: 'patient:getAll', payload: { page, limit, search: activeSearch } },
        reject: (err: unknown) => {
          throw err;
        }
      });
      
      if (!response) throw new Error('Respuesta vacía del servidor');
      
      set({ 
        patients: response.data, 
        info: response.info, 
        isLoading: false 
      });
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.message || 'Error al obtener pacientes';
      set({ error: errorMessage, isLoading: false });
    }
  },

  getPatientById: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.execute<IPatient>({
        request: { channel: 'patient:getById', payload: { patientId } },
        reject: (err: unknown) => {
          const error = err as ApiError;
          set({ error: error?.message || 'Error al obtener pacientes', isLoading: false });
          throw error;
        }
      });
      if (!response) throw new Error('Respuesta vacía del servidor');
      set({ 
        isLoading: false,
        patientDetail:response 
      });
      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.message || 'Error al obtener paciente';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getPatientByIdentityCode: async (identityCode: string) => {
    try {
      const response = await adminApi.execute<IPatient | null>({
        request: { channel: 'patient:getByIdentityCode', payload: { identityCode } },
        reject: () => null
      });
      return response || null;
    } catch {
      return null;
    }
  },

  createPatient: async (data: CreatePatientPayload): Promise<IPatient> => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.execute<IPatient>({
        request: { channel: 'patient:register', payload: data },
        hasMessage: true,
        successMessage: 'Paciente registrado con éxito',
        reject: (err: unknown) => {
          throw err;
        }
      });
      
      if (!response) throw new Error('Respuesta vacía del servidor');
      
      const currentInfo = get().info;
      const targetLimit = (currentInfo?.limit && currentInfo.limit <= 10) ? currentInfo.limit : 5;
      await get().fetchPatients(currentInfo?.page || 1, targetLimit);
      set({ isLoading: false });
      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.message || 'Error al registrar paciente';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updatePatientContact: async (patientId: string, data: UpdatePatientContactPayload) => {
    set({ isLoading: true, error: null });
    try {
     const response = await adminApi.execute<IPatient>({
        request: { channel: 'patient:updateContact', payload: { patientId, ...data } },
        hasMessage: true,
        successMessage: 'Paciente actualizado con éxito',
        reject: (error: unknown) => {
          throw error;
        }
      });
            // Valida que response no sea undefined
      if (!response) {
        throw new Error('Respuesta vacía del servidor');
      }
      const currentInfo = get().info;
      await get().fetchPatients(currentInfo?.page || 1, currentInfo?.limit || 10);
      set({
        patientDetail: response,
        isLoading: false
      });
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.message || 'Error al actualizar contacto';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deletePatient: async (patientId: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute<null>({
        request: { channel: 'patient:delete', payload: { patientId } },
        reject: (error: unknown) => {
          throw error;
        }
      });
      
      toast.success('Paciente eliminado con éxito');
      const currentInfo = get().info;
      await get().fetchPatients(currentInfo?.page || 1, currentInfo?.limit || 10);
      set({ isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error?.message || 'Error al eliminar paciente';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  }
}));
