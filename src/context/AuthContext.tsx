import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from '../shared/components/toast/toastManager';
import { type IUser } from '../types';
import { subscribeUnauthorized, subscribeForbidden } from '../shared/api/base/IpcClient';

export interface LoginUser {
    email: string;
    password?: string;
}

export interface AuthState {
    user: IUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    isLoggingOut: boolean;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginUser) => Promise<void>;
    logout: () => Promise<void>;
    createOwner: (data: { email: string; username: string }) => Promise<void>;
    refreshSession: () => Promise<void>;
    hasOwner: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getIpcApi = () => {
  if (typeof window !== 'undefined') {
    return window.api || (window as any).ipcRenderer;
  }
  return undefined;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        loading: true,
        isLoggingOut: false,
    });
    const [hasOwner, setHasOwner] = useState<boolean | null>(null);

  // ======================================================
  // UTILS Y HELPERS INTERNOS 
  // ======================================================
  const startSession = (userData: IUser, sessionId: string) => {
    setState({
        user: userData,
        isAuthenticated: true,
        loading: false,
        isLoggingOut: false
    });
    localStorage.setItem('sessionId', sessionId);
  };

  const cleanSession = () => {
    setState((prev: AuthState) => ({ ...prev, user: null, isAuthenticated: false, loading: false }));
    localStorage.removeItem('sessionId');
  };

  // ======================================================
  // FUNCIONALIDADES PUBLICAS DEL CONTEXT
  // ======================================================
  const login = async (credentials: LoginUser) => {
      try {
        const ipc = getIpcApi();
        if (!ipc || typeof ipc.invoke !== 'function') {
          throw new Error('API IPC de Electron no disponible. Abre la app desde Electron.');
        }

        const response: any = await ipc.invoke('auth:login', credentials);
        
        if (!response?.ok) {
            throw response?.error || new Error('Error desconocido en backend');
        }

        const data = response.data;
        if (data && data.session && data.user) {
            startSession(data.user, data.session.sessionId);
            toast.success('Autenticación exitosa');
        }
      } catch (error: unknown) {
        let errorMessage = 'Error de autenticación';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
        }
        toast.error(errorMessage);
        throw error;
      }
  };

  const createOwner = async (data: { email: string; username: string }) => {
      try {
        const ipc = getIpcApi();
        if (!ipc || typeof ipc.invoke !== 'function') {
          throw new Error('API IPC de Electron no disponible. Abre la app desde Electron.');
        }

        const response: any = await ipc.invoke('auth:create-initial-owner', data);
        if (!response?.ok) {
            throw response?.error || new Error('No se pudo crear el propietario');
        }
        setHasOwner(true); // Cambiamos el estado para que muestre el login
      } catch (error: unknown) {
        let errorMessage = 'Error al crear propietario';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = String((error as { message: unknown }).message);
        }
        toast.error(errorMessage);
        throw error;
      }
  };

  const logout = async () => {
    setState((prev: AuthState) => ({ ...prev, isLoggingOut: true }));
    const sessionId = localStorage.getItem('sessionId');
    
    cleanSession(); // Limpieza local inmediata (optimista)

    if (sessionId) {
      try {
        const ipc = getIpcApi();
        if (ipc && typeof ipc.invoke === 'function') {
          const response: any = await ipc.invoke('auth:logout', sessionId);
          if (!response?.ok) throw response?.error;
        }
      } catch (error) {
        console.warn('Logout falló en backend. Limpieza local finalizada', error);
      }
    }
    
    setState((prev: AuthState) => ({ ...prev, isLoggingOut: false }));
    toast.success('Sesión terminada');
  };

  const refreshSession = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    try {
      const ipc = getIpcApi();
      if (ipc && typeof ipc.invoke === 'function') {
        const response: any = await ipc.invoke('auth:getSession', sessionId);
        if (response?.ok && response.data) {
            const data = response.data;
            if (data.sessionId) {
                startSession(data.user || data, sessionId);
            }
        }
      }
    } catch (error) {
       console.warn('Error al refrescar la sesión:', error);
    }
  };

  // ======================================================
  // VALIDAR AL MONTAR LA APP E HIDRATAR ESTADO
  // ======================================================
  useEffect(() => {
    const unsubUnauth = subscribeUnauthorized(() => {
      cleanSession();
      toast.warning('Su sesión ha expirado o no es válida. Por favor, vuelva a iniciar sesión.', 'Sesión Expirada');
    });

    const unsubForbidden = subscribeForbidden(() => {
      toast.error('No tiene permisos suficientes para realizar esta acción.', 'Acceso Denegado');
    });

    const attemptHydration = async () => {
      // 1. Verificamos si existen usuarios en la DB para el flujo de "primer inicio"
      try {
        const ipc = getIpcApi();
        if (ipc && typeof ipc.invoke === 'function') {
          const checkUsersResponse: any = await ipc.invoke('auth:check-users');
          if (checkUsersResponse?.ok && checkUsersResponse.data === false) {
             setHasOwner(false);
             toast.warning('No hay usuarios registrados. Por favor, crea el usuario propietario.', 'Atención');
          } else {
             setHasOwner(true);
          }
        } else {
          setHasOwner(true);
        }
      } catch (error) {
        console.error('Error verificando usuarios iniciales:', error);
        setHasOwner(true); // Por defecto asumimos que hay para no bloquear el login en caso de error
      }

      // 2. Hidratación normal de la sesión
      const sessionId = localStorage.getItem('sessionId');
      
      if (!sessionId) {
         cleanSession();
         return;
      }

      try {
        const ipc = getIpcApi();
        if (ipc && typeof ipc.invoke === 'function') {
          const response: any = await ipc.invoke('auth:getSession', sessionId);
          
          if (!response?.ok) {
              throw response?.error;
          }

          const data = response.data;
          if (data && data.sessionId) {
              startSession(data.user || data, sessionId);
          } else {
              cleanSession();
          }
        }
      } catch (error) {
         console.warn('Sesión inválida o expirada:', error);
         cleanSession();
      }
    };

    attemptHydration();

    return () => {
      unsubUnauth();
      unsubForbidden();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        createOwner,
        refreshSession,
        hasOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
