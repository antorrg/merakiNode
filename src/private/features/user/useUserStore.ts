import { create } from 'zustand';
import { IUser } from '../../../shared/types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export interface UserState {
  users: IUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    await adminApi.execute<IUser[]>({
      request: { channel: 'users.getAll' },
      reject: (err: any) => {
        set({ error: err?.message || 'Error al obtener usuarios', isLoading: false });
      }
    }).then(data => {
      if (data) set({ users: data, isLoading: false });
    });
  },

  createUser: async (data: any) => {
    set({ isLoading: true, error: null });
    
    await adminApi.execute({
      request: { channel: 'user:create', payload: data },
      hasMessage: true,
      successMessage: 'Usuario creado con éxito',
      reject: (err: any) => {
        set({ error: err?.message || 'Error al crear usuario', isLoading: false });
        throw err;
      }
    }).then(async () => {
      await get().fetchUsers();
      set({ isLoading: false });
    });
  },

  updateUser: async (userId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Actualizar perfil
      if (data.email || data.name || data.nickname) {
        await adminApi.execute({
          request: { channel: 'user:updateProfile', payload: { userId, email: data.email, name: data.name, nickname: data.nickname } },
          reject: (err: any) => { throw err; }
        });
      }
      // 2. Actualizar rol
      if (data.role) {
        await adminApi.execute({
          request: { channel: 'user:updateRole', payload: { userId, role: data.role } },
          reject: (err: any) => { throw err; }
        });
      }
      // 3. Actualizar estado
      if (data.enabled !== undefined) {
        await adminApi.execute({
          request: { channel: 'user:updateStatus', payload: { userId, enabled: data.enabled } },
          reject: (err: any) => { throw err; }
        });
      }

      toast.success('Usuario actualizado con éxito');
      await get().fetchUsers();
      set({ isLoading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err?.message || 'Error al actualizar usuario', isLoading: false });
      toast.error(err?.message || 'Error al actualizar usuario');
      throw err;
    }
  }
}));
