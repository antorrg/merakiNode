import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore } from './useUserStore';
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

describe('useUserStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({
      users: [],
      selectedUser: undefined,
      myProfile: null,
      isLoading: false,
      error: null,
    });
  });

  it('debería inicializar con el estado por defecto', () => {
    const state = useUserStore.getState();
    expect(state.users).toEqual([]);
    expect(state.myProfile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('debería cargar usuarios correctamente con fetchUsers', async () => {
    const mockUsers = [
      { userId: 'u1', userName: 'User 1', userEmail: 'u1@test.com', role: 'PROFESIONAL' },
      { userId: 'u2', userName: 'User 2', userEmail: 'u2@test.com', role: 'PROPIETARIO' },
    ];

    vi.mocked(adminApi.execute).mockResolvedValueOnce(mockUsers as any);

    await useUserStore.getState().fetchUsers();

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: { channel: 'users:getAll' },
      reject: expect.any(Function),
    });
    expect(useUserStore.getState().users).toEqual(mockUsers);
    expect(useUserStore.getState().isLoading).toBe(false);
    expect(useUserStore.getState().error).toBeNull();
  });

  it('debería manejar error al fallar fetchUsers', async () => {
    vi.mocked(adminApi.execute).mockImplementationOnce(async (config: any) => {
      config.reject({ message: 'Error de red' });
      return undefined as any;
    });

    await useUserStore.getState().fetchUsers();

    expect(useUserStore.getState().error).toBe('Error de red');
    expect(useUserStore.getState().isLoading).toBe(false);
  });

  it('debería obtener mi perfil con fetchMyProfile', async () => {
    const mockProfile = { userId: 'u1', userName: 'User 1', userEmail: 'u1@test.com' };
    vi.mocked(adminApi.execute).mockResolvedValueOnce(mockProfile as any);

    await useUserStore.getState().fetchMyProfile('u1');

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: { channel: 'user:getById', payload: { userId: 'u1' } },
      reject: expect.any(Function),
    });
    expect(useUserStore.getState().myProfile).toEqual(mockProfile);
  });

  it('debería eliminar un usuario con deleteUser', async () => {
    vi.mocked(adminApi.execute).mockResolvedValueOnce({ success: true } as any); // para delete
    vi.mocked(adminApi.execute).mockResolvedValueOnce([] as any); // para fetchUsers llamado después

    await useUserStore.getState().deleteUser('u1');

    expect(adminApi.execute).toHaveBeenCalledWith({
      request: { channel: 'user:delete', payload: { userId: 'u1' } },
      reject: expect.any(Function),
    });
  });
});
