import { create } from 'zustand';
import { adminApi } from '../../../shared/api/api';
import defaultLogo from '../../../assets/medicalLogo.svg';

export interface PdfConfig {
  fontSize: 'sm' | 'md' | 'lg';
  showLinkedDiagnoses: boolean;
  showDiagnosisSummary: boolean;
  showObservations: boolean;
  showTreatmentPlan: boolean;
  showRecommendations: boolean;
  customHeaderNotes?: string;
  logoUrl?: string | null;
  institutionName?: string;
}

export interface BackupConfig {
  enabled: boolean;
  frequencyDays: number;
  maxRetentionFiles: number;
  lastBackupDate?: string | null;
}

export interface AppConfig {
  appName?: string;
  shortName?: string;
  legalName?: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  customHeaderNotes?: string;
  pdf: PdfConfig;
  backup: BackupConfig;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Meraki Espacio Integral',
  shortName: 'Meraki',
  legalName: 'Espacio Integral Meraki',
  logoUrl: defaultLogo,
  phone: '',
  email: '',
  address: '',
  customHeaderNotes: '',
  pdf: {
    fontSize: 'md',
    showLinkedDiagnoses: true,
    showDiagnosisSummary: true,
    showObservations: true,
    showTreatmentPlan: true,
    showRecommendations: true,
    customHeaderNotes: '',
    logoUrl: defaultLogo,
    institutionName: 'Meraki Espacio Integral',
  },
  backup: {
    enabled: true,
    frequencyDays: 1,
    maxRetentionFiles: 10,
    lastBackupDate: null,
  },
};

interface ConfigState {
  config: AppConfig;
  isLoading: boolean;
  isSaving: boolean;
  isPerformingBackup: boolean;
  isPerformingMaintenance: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  updatePdfConfig: (newPdfConfig: Partial<PdfConfig>) => void;
  updateBackupConfig: (newBackupConfig: Partial<BackupConfig>) => void;
  saveConfig: () => Promise<boolean>;
  triggerManualBackup: () => Promise<{ success: boolean; path?: string }>;
  triggerMaintenance: () => Promise<{ success: boolean; logsDeleted?: number; vacuumExecuted?: boolean }>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: DEFAULT_APP_CONFIG,
  isLoading: false,
  isSaving: false,
  isPerformingBackup: false,
  isPerformingMaintenance: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const res = await adminApi.execute<AppConfig>({
        request: { channel: 'config:get', payload: {} },
      });
      if (res) {
        set({
          config: {
            ...DEFAULT_APP_CONFIG,
            ...res,
            pdf: {
              ...DEFAULT_APP_CONFIG.pdf,
              ...(res.pdf || {}),
            },
            backup: {
              ...DEFAULT_APP_CONFIG.backup,
              ...(res.backup || {}),
            },
          },
        });
      }
    } catch (err) {
      console.error('Error al cargar la configuración:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfig: (newConfig: Partial<AppConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        ...newConfig,
      },
    }));
  },

  updatePdfConfig: (newPdfConfig: Partial<PdfConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        pdf: {
          ...state.config.pdf,
          ...newPdfConfig,
        },
      },
    }));
  },

  updateBackupConfig: (newBackupConfig: Partial<BackupConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        backup: {
          ...state.config.backup,
          ...newBackupConfig,
        },
      },
    }));
  },

  saveConfig: async () => {
    set({ isSaving: true });
    try {
      const currentConfig = get().config;
      await adminApi.execute<AppConfig>({
        request: { channel: 'config:save', payload: { config: currentConfig } },
      });
      return true;
    } catch (err) {
      console.error('Error al guardar la configuración:', err);
      return false;
    } finally {
      set({ isSaving: false });
    }
  },

  triggerManualBackup: async () => {
    set({ isPerformingBackup: true });
    try {
      const res = await adminApi.execute<{ success: boolean; path?: string }>({
        request: { channel: 'backup:createManual', payload: {} },
      });
      if (res && res.success) {
        await get().fetchConfig(); // Refresca fecha de último backup
        return res;
      }
      return { success: false };
    } catch (err) {
      console.error('Error al ejecutar backup manual:', err);
      return { success: false };
    } finally {
      set({ isPerformingBackup: false });
    }
  },

  triggerMaintenance: async () => {
    set({ isPerformingMaintenance: true });
    try {
      const res = await adminApi.execute<{ success: boolean; logsDeleted?: number; vacuumExecuted?: boolean }>({
        request: { channel: 'backup:runMaintenance', payload: {} },
      });
      return res || { success: false };
    } catch (err) {
      console.error('Error al ejecutar mantenimiento:', err);
      return { success: false };
    } finally {
      set({ isPerformingMaintenance: false });
    }
  },
}));
