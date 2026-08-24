import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore, DEFAULT_APP_CONFIG } from './useConfigStore';

describe('useConfigStore', () => {
  beforeEach(() => {
    useConfigStore.setState({
      config: DEFAULT_APP_CONFIG,
      isLoading: false,
      isSaving: false,
      isPerformingBackup: false,
      isPerformingMaintenance: false,
    });
  });

  it('debería inicializar con la configuración por defecto', () => {
    const state = useConfigStore.getState();
    expect(state.config.pdf.fontSize).toBe('md');
    expect(state.config.backup.enabled).toBe(true);
    expect(state.config.backup.frequencyDays).toBe(1);
  });

  it('debería actualizar la configuración de PDF con updatePdfConfig', () => {
    useConfigStore.getState().updatePdfConfig({ fontSize: 'lg', showObservations: false });
    const state = useConfigStore.getState();
    expect(state.config.pdf.fontSize).toBe('lg');
    expect(state.config.pdf.showObservations).toBe(false);
  });

  it('debería actualizar la configuración de Backup con updateBackupConfig', () => {
    useConfigStore.getState().updateBackupConfig({ frequencyDays: 5, maxRetentionFiles: 15 });
    const state = useConfigStore.getState();
    expect(state.config.backup.frequencyDays).toBe(5);
    expect(state.config.backup.maxRetentionFiles).toBe(15);
  });
});
