import { create } from 'zustand';
import { adminApi } from '../../../shared/api/api';
import {
  type AppConfig,
  type PdfConfig,
  type BackupConfig,
  DEFAULT_APP_CONFIG,
} from '../../../../electron/config.types';

export type { AppConfig, PdfConfig, BackupConfig };
export { DEFAULT_APP_CONFIG };

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
        const sanitizeLogo = (url?: string | null) => {
          if (!url || url === '/medicalLogo.png' || url === 'medicalLogo.png') return null;
          return url;
        };
        const logoUrl = sanitizeLogo(res.logoUrl);
        const pdfLogoUrl = sanitizeLogo(res.pdf?.logoUrl ?? res.logoUrl);

        set({
          config: {
            ...DEFAULT_APP_CONFIG,
            ...res,
            logoUrl,
            pdf: {
              ...DEFAULT_APP_CONFIG.pdf,
              ...(res.pdf || {}),
              logoUrl: pdfLogoUrl,
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
