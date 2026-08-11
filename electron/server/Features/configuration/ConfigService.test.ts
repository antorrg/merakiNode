import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ConfigService } from './ConfigService';

describe('ConfigService', () => {
  const testConfigPath = path.join(process.cwd(), 'config.json');

  afterEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  it('debería retornar la configuración por defecto si config.json no existe', () => {
    const service = new ConfigService();
    const config = service.getConfig();
    expect(config).toBeDefined();
    expect(config.pdf.fontSize).toBe('md');
    expect(config.pdf.showObservations).toBe(true);
  });

  it('debería guardar la configuración correctamente en config.json', () => {
    const service = new ConfigService();
    const updated = service.saveConfig({
      pdf: {
        fontSize: 'lg',
        showLinkedDiagnoses: false,
        showDiagnosisSummary: true,
        showObservations: true,
        showTreatmentPlan: true,
        showRecommendations: true,
      },
    });

    expect(updated.pdf.fontSize).toBe('lg');
    expect(updated.pdf.showLinkedDiagnoses).toBe(false);

    const reloaded = service.getConfig();
    expect(reloaded.pdf.fontSize).toBe('lg');
  });
});
