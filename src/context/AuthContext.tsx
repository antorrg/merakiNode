import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from '../shared/components/toast/toastManager';
export interface LoginUser {
    email: string;
    password?: string;
}

export interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
    isLoggingOut: boolean;
}
interface AuthContextType extends AuthState {
    login: (credentials: LoginUser) => Promise<void>;
    logout: () => Promise<void>;
    createOwner: (data: { email: string; username: string }) => Promise<void>;
    hasOwner: boolean | null;
    isAuthenticated: boolean;
    user: any;
    loading: boolean;
    isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const startSession = (userData: any, sessionId: string) => {
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
        const response = await window.ipcRenderer.invoke('auth:login', credentials);
        
        if (!response?.ok) {
            throw response?.error || new Error('Error desconocido en backend');
        }

        const data = response.data;
        if (data && data.session && data.user) {
            startSession(data.user, data.session.sessionId);
            toast.success('Autenticación exitosa');
        }
      } catch (error: any) {
        const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error de autenticación');
        toast.error(errorMessage);
        throw error;
      }
  };

  const createOwner = async (data: { email: string; username: string }) => {
      try {
        const response = await window.ipcRenderer.invoke('auth:create-initial-owner', data);
        if (!response?.ok) {
            throw response?.error || new Error('No se pudo crear el propietario');
        }
        setHasOwner(true); // Cambiamos el estado para que muestre el login
      } catch (error: any) {
        const errorMessage = typeof error === 'string' ? error : (error?.message || 'Error al crear propietario');
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
        const response = await window.ipcRenderer.invoke('auth:logout', sessionId);
        if (!response?.ok) throw response?.error;
      } catch (error) {
        console.warn('Logout falló en backend. Limpieza local finalizada', error);
      }
    }
    
    setState((prev: AuthState) => ({ ...prev, isLoggingOut: false }));
    toast.success('Sesión terminada');
  };

  // ======================================================
  // VALIDAR AL MONTAR LA APP E HIDRATAR ESTADO
  // ======================================================
  useEffect(() => {
    const attemptHydration = async () => {
      // 1. Verificamos si existen usuarios en la DB para el flujo de "primer inicio"
      try {
        const checkUsersResponse = await window.ipcRenderer.invoke('auth:check-users');
        if (checkUsersResponse?.ok && checkUsersResponse.data === false) {
           setHasOwner(false);
           toast.warning('No hay usuarios registrados. Por favor, crea el usuario propietario.', 'Atención');
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
        const response = await window.ipcRenderer.invoke('auth:getSession', sessionId);
        
        if (!response?.ok) {
            throw response?.error;
        }

        const data = response.data;
        if (data && data.sessionId) {
            startSession(data.user || data, sessionId);
        } else {
            cleanSession();
        }
      } catch (error) {
         console.warn('Sesión inválida o expirada:', error);
         cleanSession();
      }
    };

    attemptHydration();
  }, []);

    return (
        <AuthContext.Provider value={{ ...state, hasOwner, login, logout, createOwner }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
