import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePatientStore } from './usePatientStore';
import { adminApi } from '../../../shared/api/api';

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

describe('usePatientStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePatientStore.setState({
      patients: [],
      patientDetail: null,
      info: null,
      isLoading: false,
      error: null,
      searchTerm: '',
    });
  });

  it('debería inicializar con valores por defecto', () => {
    const state = usePatientStore.getState();
    expect(state.patients).toEqual([]);
    expect(state.patientDetail).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.searchTerm).toBe('');
  });

  it('debería actualizar el término de búsqueda con setSearchTerm', () => {
    usePatientStore.getState().setSearchTerm('Juan');
    expect(usePatientStore.getState().searchTerm).toBe('Juan');
  });

  it('debería obtener la lista de pacientes con fetchPatients', async () => {
    const mockResponse = {
      data: [{ patientId: 'p1', firstName: 'Juan', lastName: 'Perez' }],
      info: { page: 1, limit: 5, totalItems: 1, totalPages: 1 },
    };

    vi.mocked(adminApi.execute).mockResolvedValueOnce(mockResponse as any);

    await usePatientStore.getState().fetchPatients(1, 5, 'Juan');

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: { channel: 'patient:getAll', payload: { page: 1, limit: 5, search: 'Juan' } },
      reject: expect.any(Function),
    });
    expect(usePatientStore.getState().patients).toEqual(mockResponse.data);
    expect(usePatientStore.getState().info).toEqual(mockResponse.info);
    expect(usePatientStore.getState().isLoading).toBe(false);
  });

  it('debería buscar paciente por DNI con getPatientByIdentityCode', async () => {
    const mockPatient = { patientId: 'p1', identityCode: '12345678' };
    vi.mocked(adminApi.execute).mockResolvedValueOnce(mockPatient as any);

    const res = await usePatientStore.getState().getPatientByIdentityCode('12345678');

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: { channel: 'patient:getByIdentityCode', payload: { identityCode: '12345678' } },
      reject: expect.any(Function),
    });
    expect(res).toEqual(mockPatient);
  });
});
