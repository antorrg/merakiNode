import { describe, it, expect, beforeEach } from 'vitest';
import { useConfigStore, DEFAULT_APP_CONFIG } from './useConfigStore';

describe('useConfigStore', () => {
  beforeEach(() => {
    useConfigStore.setState({
      config: DEFAULT_APP_CONFIG,
      isLoading: false,
      isSaving: false,
    });
  });

  it('debería inicializar con la configuración por defecto', () => {
    const state = useConfigStore.getState();
    expect(state.config.pdf.fontSize).toBe('md');
  });

  it('debería actualizar la configuración de PDF con updatePdfConfig', () => {
    useConfigStore.getState().updatePdfConfig({ fontSize: 'lg', showObservations: false });
    const state = useConfigStore.getState();
    expect(state.config.pdf.fontSize).toBe('lg');
    expect(state.config.pdf.showObservations).toBe(false);
  });
});
