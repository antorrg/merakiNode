import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryPdfStore } from './useHistoryPdfStore';

describe('useHistoryPdfStore', () => {
  beforeEach(() => {
    useHistoryPdfStore.setState({
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
    });
  });

  it('debería seleccionar y deseleccionar entradas con toggleSelectEntry', () => {
    useHistoryPdfStore.getState().toggleSelectEntry('e1');
    expect(useHistoryPdfStore.getState().selectedEntryIds['e1']).toBe(true);
    expect(useHistoryPdfStore.getState().getSelectedCount()).toBe(1);

    useHistoryPdfStore.getState().toggleSelectEntry('e1');
    expect(useHistoryPdfStore.getState().selectedEntryIds['e1']).toBeUndefined();
    expect(useHistoryPdfStore.getState().getSelectedCount()).toBe(0);
  });

  it('debería seleccionar todas y deseleccionar todas las entradas', () => {
    const entries = [
      { entryId: 'e1' } as any,
      { entryId: 'e2' } as any,
    ];

    useHistoryPdfStore.getState().selectAllEntries(entries);
    expect(useHistoryPdfStore.getState().isAllSelected(entries)).toBe(true);
    expect(useHistoryPdfStore.getState().getSelectedCount()).toBe(2);

    useHistoryPdfStore.getState().deselectAllEntries();
    expect(useHistoryPdfStore.getState().getSelectedCount()).toBe(0);
  });

  it('debería abrir modal con abrirExportModal y preparar borradores', () => {
    const entries = [
      { entryId: 'e1', patientId: 'p1', professionalId: 'prof1', visitType: 'PRESENTIAL', visitDate: '2026-08-01', reason: 'Control' } as any,
    ];

    useHistoryPdfStore.getState().toggleSelectEntry('e1');
    useHistoryPdfStore.getState().openExportModal(entries);

    expect(useHistoryPdfStore.getState().isModalOpen).toBe(true);
    expect(useHistoryPdfStore.getState().draftEntries.length).toBe(1);
    expect(useHistoryPdfStore.getState().draftEntries[0].reason).toBe('Control');
  });

  it('debería actualizar campos de borrador con updateDraftEntryField', () => {
    useHistoryPdfStore.setState({
      draftEntries: [
        { entryId: 'e1', reason: 'Antiguo motivo' } as any,
      ],
    });

    useHistoryPdfStore.getState().updateDraftEntryField('e1', 'reason', 'Nuevo motivo editado');
    expect(useHistoryPdfStore.getState().draftEntries[0].reason).toBe('Nuevo motivo editado');
  });

  it('debería actualizar la configuración de PDF con updatePdfConfig', () => {
    useHistoryPdfStore.getState().updatePdfConfig({ showObservations: false, fontSize: 'lg' });
    expect(useHistoryPdfStore.getState().pdfConfig.showObservations).toBe(false);
    expect(useHistoryPdfStore.getState().pdfConfig.fontSize).toBe('lg');
  });
});
