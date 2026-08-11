import { create } from 'zustand';
import { adminApi } from '../../../shared/api/api';

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

export interface AppConfig {
  appName?: string;
  pdf: PdfConfig;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Meraki Espacio Integral',
  pdf: {
    fontSize: 'md',
    showLinkedDiagnoses: true,
    showDiagnosisSummary: true,
    showObservations: true,
    showTreatmentPlan: true,
    showRecommendations: true,
    customHeaderNotes: '',
    logoUrl: '/medicalLogo.png',
    institutionName: 'Meraki Espacio Integral',
  },
};

interface ConfigState {
  config: AppConfig;
  isLoading: boolean;
  isSaving: boolean;
  fetchConfig: () => Promise<void>;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  updatePdfConfig: (newPdfConfig: Partial<PdfConfig>) => void;
  saveConfig: () => Promise<boolean>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: DEFAULT_APP_CONFIG,
  isLoading: false,
  isSaving: false,

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
}));
