import { create } from 'zustand';
import { IUser } from '../../../shared/types';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';

export interface UserState {
  users: IUser[];
  selectedUser?: IUser | undefined;
  myProfile: IUser | null;
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchMyProfile: (userId: string) => Promise<void>;
  createUser: (data: any) => Promise<void>;
  updateUser: (userId: string, data: any) => Promise<void>;
  upgradeUser:(userId:string, data:any) => Promise<void>
  deleteUser:(userId:string) => Promise<void>
  updateMyProfile: (userId: string, data: any) => Promise<void>;
  changePasswordUser: (data: any) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: undefined,
  myProfile: null,
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

  fetchMyProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    await adminApi.execute<IUser>({
      request: { channel: 'user:getById', payload: { userId } },
      reject: (err: any) => {
        set({ error: err?.message || 'Error al obtener perfil', isLoading: false });
      }
    }).then(data => {
      if (data) set({ myProfile: data, isLoading: false });
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
      toast.success('Usuario actualizado con éxito');
      await get().fetchUsers();
      set({ isLoading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err?.message || 'Error al actualizar usuario', isLoading: false });
      toast.error(err?.message || 'Error al actualizar usuario');
      throw err;
    }
  },
    upgradeUser: async (userId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      // 2. Actualizar rol
      if (data.role) {
        await adminApi.execute({
          request: { channel: 'user:updateStatus', payload: { userId,  enabled: data.enabled, role: data.role } },
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
  },
  updateMyProfile: async (userId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      if (data.email || data.name || data.nickname) {
        await adminApi.execute({
          request: { channel: 'user:updateProfile', payload: { userId, email: data.email, name: data.name, nickname: data.nickname } },
          reject: (err: any) => { throw err; }
        });
      }
      toast.success('Perfil actualizado con éxito');
      set({ isLoading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err?.message || 'Error al actualizar perfil', isLoading: false });
      toast.error(err?.message || 'Error al actualizar perfil');
      throw err;
    }
  },
  changePasswordUser: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.execute({
        request: { channel: 'user:updatePassword', payload: { userId: data.userId, password: data.password, newPassword: data.newPassword } },
        reject: (err: any) => { throw err; }
      });
      toast.success('Contraseña actualizada con éxito');
      set({ isLoading: false });
    } catch (err: any) {
      console.error(err);
      set({ error: err?.message || 'Error al actualizar contraseña', isLoading: false });
      toast.error(err?.message || 'Error al actualizar contraseña');
      throw err;
    }
  },
  deleteUser: async(userId:string):Promise<void>=>{
    set({isLoading:true, error:null})
    try {
      if(userId){
        await adminApi.execute({
          request:{channel: 'user:delete', payload:{userId}},
          reject: (err:any) => {throw err}
        })
      }
      toast.success('Usuario eliminado con exito')
      await get().fetchUsers()
      set({ isLoading:false })
      
    } catch (err:any) {
      set({ error: err?.message || 'Error al actualizar usuario', isLoading: false });
      toast.error(err?.message || 'Error al actualizar usuario');
      throw err;
    }
  }
}));
