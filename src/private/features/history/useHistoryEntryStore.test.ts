import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import { adminApi } from '../../../shared/api/api';
import { VisitType } from '../../../types';

vi.mock('../../../shared/api/api', () => ({
  adminApi: {
    execute: vi.fn(),
  },
}));

vi.mock('../../../shared/components/toast/toastManager', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useHistoryEntryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHistoryEntryStore.setState({
      entriesByPatient: {},
      draftsByPatient: {},
      isLoading: false,
      error: null,
    });
  });

  it('debería gestionar borradores de pacientes con setDraft y clearDraft', () => {
    const patientId = 'p100';

    useHistoryEntryStore.getState().setDraft(patientId, { reason: 'Consulta de control' });
    expect(useHistoryEntryStore.getState().draftsByPatient[patientId]).toEqual({ reason: 'Consulta de control' });

    useHistoryEntryStore.getState().setDraft(patientId, { visitType: VisitType.PRESENTIAL });
    expect(useHistoryEntryStore.getState().draftsByPatient[patientId]).toEqual({
      reason: 'Consulta de control',
      visitType: VisitType.PRESENTIAL,
    });

    useHistoryEntryStore.getState().clearDraft(patientId);
    expect(useHistoryEntryStore.getState().draftsByPatient[patientId]).toBeUndefined();
  });

  it('debería rechazar guardar un borrador sin motivo de consulta', async () => {
    const patientId = 'p100';
    useHistoryEntryStore.getState().setDraft(patientId, { reason: '  ' });

    const success = await useHistoryEntryStore.getState().saveNewEntry(patientId);
    expect(success).toBe(false);
    expect(adminApi.execute).not.toHaveBeenCalled();
  });

  it('debería guardar una nueva entrada con saveNewEntry', async () => {
    const patientId = 'p100';
    useHistoryEntryStore.getState().setDraft(patientId, {
      reason: 'Dolor abdominal',
      visitType: VisitType.PRESENTIAL,
    });

    vi.mocked(adminApi.execute).mockResolvedValueOnce({ entryId: 'e1' } as any); // para save
    vi.mocked(adminApi.execute).mockResolvedValueOnce([] as any); // para refetch

    const success = await useHistoryEntryStore.getState().saveNewEntry(patientId);

    expect(success).toBe(true);
    expect(adminApi.execute).toHaveBeenCalledWith({
      request: {
        channel: 'entry:add',
        payload: expect.objectContaining({
          patientId: 'p100',
          reason: 'Dolor abdominal',
          visitType: VisitType.PRESENTIAL,
        }),
      },
      hasMessage: true,
      successMessage: 'Evolución registrada correctamente',
      reject: expect.any(Function),
    });
    expect(useHistoryEntryStore.getState().draftsByPatient[patientId]).toBeUndefined();
  });
});
