import { create } from 'zustand';
import { IHistoryEntry } from '../../../types';

export interface DraftHistoryEntry {
  entryId: string;
  patientId: string;
  professionalId: string;
  visitType: string;
  visitDate: string;
  reason: string;
  linkedDiagnosesText: string;
  diagnosisSummary: string;
  observations: string;
  evolution: string;
  treatmentPlan: string;
  recommendations: string;
}

export interface PdfConfig {
  showLinkedDiagnoses: boolean;
  showDiagnosisSummary: boolean;
  showObservations: boolean;
  showTreatmentPlan: boolean;
  showRecommendations: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  customHeaderNotes: string;
  logoUrl: string | null;
}

export interface HistoryPdfState {
  selectedEntryIds: Record<string, boolean>;
  isModalOpen: boolean;
  draftEntries: DraftHistoryEntry[];
  pdfConfig: PdfConfig;

  // Acciones
  toggleSelectEntry: (entryId: string) => void;
  selectAllEntries: (entries: IHistoryEntry[]) => void;
  deselectAllEntries: () => void;
  isAllSelected: (entries: IHistoryEntry[]) => boolean;
  getSelectedCount: () => number;
  openExportModal: (allEntries: IHistoryEntry[], activeDiagnoses?: unknown[]) => void;
  closeExportModal: () => void;
  updateDraftEntryField: (entryId: string, field: keyof DraftHistoryEntry, value: string) => void;
  updatePdfConfig: (config: Partial<PdfConfig>) => void;
}

const translateDiagnosisStatus = (status?: string): string => {
  switch (status) {
    case 'ACTIVE': return 'ACTIVO';
    case 'CHRONIC': return 'CRÓNICO';
    case 'RESOLVED': return 'RESUELTO';
    case 'SUSPENDED': return 'SUSPENDIDO';
    default: return status || 'ACTIVO';
  }
};

export const useHistoryPdfStore = create<HistoryPdfState>((set, get) => ({
  selectedEntryIds: {},
  isModalOpen: false,
  draftEntries: [],
  pdfConfig: {
    showLinkedDiagnoses: true,
    showDiagnosisSummary: true,
    showObservations: true,
    showTreatmentPlan: true,
    showRecommendations: true,
    fontSize: 'md',
    customHeaderNotes: '',
    logoUrl: '/merakifav.png',
  },

  toggleSelectEntry: (entryId: string) => {
    set((state) => {
      const current = !!state.selectedEntryIds[entryId];
      const updated = { ...state.selectedEntryIds };
      if (current) {
        delete updated[entryId];
      } else {
        updated[entryId] = true;
      }
      return { selectedEntryIds: updated };
    });
  },

  selectAllEntries: (entries: IHistoryEntry[]) => {
    const updated: Record<string, boolean> = {};
    entries.forEach((e) => {
      updated[e.entryId] = true;
    });
    set({ selectedEntryIds: updated });
  },

  deselectAllEntries: () => {
    set({ selectedEntryIds: {} });
  },

  isAllSelected: (entries: IHistoryEntry[]) => {
    if (!entries || entries.length === 0) return false;
    const { selectedEntryIds } = get();
    return entries.every((e) => !!selectedEntryIds[e.entryId]);
  },

  getSelectedCount: () => {
    return Object.keys(get().selectedEntryIds).length;
  },

  openExportModal: (allEntries: IHistoryEntry[], activeDiagnoses: any[] = []) => { //eslint-disable-line
    const { selectedEntryIds } = get();
    const selected = allEntries.filter((e) => selectedEntryIds[e.entryId]);

    const draftEntries: DraftHistoryEntry[] = selected.map((e) => {
      let linkedText = '';
      if (e.diagnosisIds && e.diagnosisIds.length > 0 && activeDiagnoses.length > 0) {
        const linked = activeDiagnoses.filter((d) => e.diagnosisIds?.includes(d.diagnosisId));
        if (linked.length > 0) {
          linkedText = linked.map((d) => `${d.title} (${translateDiagnosisStatus(d.status)})`).join(', ');
        }
      } else if (activeDiagnoses.length > 0) {
        // Si la entrada no tenía IDs explícitos vinculados, tomar los diagnósticos activos del paciente
        linkedText = activeDiagnoses.map((d) => `${d.title} (${translateDiagnosisStatus(d.status)})`).join(', ');
      }

      return {
        entryId: e.entryId,
        patientId: e.patientId,
        professionalId: e.professionalId,
        visitType: e.visitType,
        visitDate: e.visitDate,
        reason: e.reason || '',
        linkedDiagnosesText: linkedText,
        diagnosisSummary: e.diagnosisSummary || '',
        observations: e.observations || '',
        evolution: e.evolution || '',
        treatmentPlan: e.treatmentPlan || '',
        recommendations: e.recommendations || '',
      };
    });

    set({ draftEntries, isModalOpen: true });
  },

  closeExportModal: () => {
    set({ isModalOpen: false });
  },

  updateDraftEntryField: (entryId: string, field: keyof DraftHistoryEntry, value: string) => {
    set((state) => ({
      draftEntries: state.draftEntries.map((draft) =>
        draft.entryId === entryId ? { ...draft, [field]: value } : draft
      ),
    }));
  },

  updatePdfConfig: (newConfig: Partial<PdfConfig>) => {
    set((state) => ({
      pdfConfig: { ...state.pdfConfig, ...newConfig },
    }));
  },
}));
