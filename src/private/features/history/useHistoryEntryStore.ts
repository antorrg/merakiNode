import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IHistoryEntry, VisitType } from '../../../types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export type HistoryEntryCreate = Omit<IHistoryEntry, 'entryId' | 'professionalId'>;

// Hacemos que el borrador sea Partial para permitir guardados incompletos
export type DraftEntry = Partial<HistoryEntryCreate> & { entryId?: string };

interface HistoryEntryState {
  // Estado
  entriesByPatient: Record<string, IHistoryEntry[]>;
  draftsByPatient: Record<string, DraftEntry>;
  isLoading: boolean;
  error: string | null;

  // Acciones de Borrador (Sincrónicas)
  setDraft: (patientId: string, data: Partial<DraftEntry>) => void;
  clearDraft: (patientId: string) => void;

  // Acciones de Red (Asincrónicas)
  fetchEntriesByPatient: (patientId: string) => Promise<void>;
  saveNewEntry: (patientId: string) => Promise<boolean>;
  loadEntryForEdit: (patientId: string, entry: IHistoryEntry) => void;
}

export const useHistoryEntryStore = create<HistoryEntryState>()(
  persist(
    (set, get) => ({
      entriesByPatient: {},
      draftsByPatient: {},
      isLoading: false,
      error: null,

      setDraft: (patientId, data) => set((state) => {
        const currentDraft = state.draftsByPatient[patientId] || {};
        return {
          draftsByPatient: {
            ...state.draftsByPatient,
            [patientId]: { ...currentDraft, ...data }
          }
        };
      }),

      clearDraft: (patientId) => set((state) => {
        const newDrafts = { ...state.draftsByPatient };
        delete newDrafts[patientId];
        return { draftsByPatient: newDrafts };
      }),

      loadEntryForEdit: (patientId, entry) => set((state) => ({
        draftsByPatient: {
          ...state.draftsByPatient,
          [patientId]: { ...entry }
        }
      })),

      fetchEntriesByPatient: async (patientId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminApi.execute<IHistoryEntry[]>({
            request: { channel: 'entry:getByPatient', payload: { patientId } },
            reject: (err: unknown) => { throw err; }
          });
          
          if (!response) throw new Error('Respuesta vacía del servidor');
          
          set((state) => ({
            entriesByPatient: {
              ...state.entriesByPatient,
              [patientId]: response
            },
            isLoading: false
          }));
        } catch (err: unknown) {
          const error = err as Error;
          set({ error: error.message || 'Error al obtener entradas', isLoading: false });
        }
      },

      saveNewEntry: async (patientId) => {
        const draft = get().draftsByPatient[patientId];
        
        // Validación básica antes de enviar al backend
        if (!draft || !draft.reason || draft.reason.trim().length < 2) {
          toast.error('El motivo de la consulta es obligatorio y debe ser válido.');
          return false;
        }

        if (!draft.visitType) {
           draft.visitType = VisitType.PRESENTIAL; // Valor por defecto
        }
        
        if (!draft.visitDate) {
           draft.visitDate = new Date().toISOString();
        }

        set({ isLoading: true, error: null });
        try {
          // Nota: El professionalId se inyecta en el backend desde la sesión (withAuth)
          const payload = {
            patientId,
            ...draft
          };

          const channel = draft.entryId ? 'entry:update' : 'entry:add';
          const successMsg = draft.entryId ? 'Evolución actualizada correctamente' : 'Evolución registrada correctamente';

          await adminApi.execute<IHistoryEntry>({
            request: { channel, payload },
            hasMessage: true,
            successMessage: successMsg,
            reject: (err: unknown) => { throw err; }
          });

          // Limpiar el borrador porque ya se guardó con éxito
          get().clearDraft(patientId);
          
          // Refetch para tener la lista actualizada
          await get().fetchEntriesByPatient(patientId);
          
          return true;
        } catch (err: unknown) {
          const error = err as Error;
          set({ error: error.message || 'Error al guardar evolución', isLoading: false });
          toast.error(error.message || 'No se pudo guardar la evolución');
          return false;
        }
      }
    }),
    {
      name: 'history-entry-drafts-storage', // Nombre para localStorage
      partialize: (state) => ({ draftsByPatient: state.draftsByPatient }), // Solo persistir los borradores
    }
  )
);
