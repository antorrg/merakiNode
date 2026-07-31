export interface IpcRequestConfig {
  channel: import('../../../../electron/white-list.js').AllowedInvokeChannel | (string & {});
  payload?: any;
}

interface IpcClientOptions {
  getSessionId?: () => string | null | undefined;
  requireAuth?: boolean;
  onUnauthorized?: (error: any) => void | Promise<void>;
  onForbidden?: (error: any) => void | Promise<void>;
  onResponseError?: (error: any) => void | Promise<void>;
}

type SessionListener = (error: any) => void;
const unauthorizedListeners: Set<SessionListener> = new Set();
const forbiddenListeners: Set<SessionListener> = new Set();

export const subscribeUnauthorized = (listener: SessionListener) => {
  unauthorizedListeners.add(listener);
  return () => { unauthorizedListeners.delete(listener); };
};

export const subscribeForbidden = (listener: SessionListener) => {
  forbiddenListeners.add(listener);
  return () => { forbiddenListeners.delete(listener); };
};

const notifyUnauthorized = (error: any) => {
  unauthorizedListeners.forEach(fn => fn(error));
};

const notifyForbidden = (error: any) => {
  forbiddenListeners.forEach(fn => fn(error));
};

export class IpcClient {
  private getSessionId?: () => string | null | undefined;
  private requireAuth: boolean;
  private onUnauthorized?: (error: any) => void | Promise<void>;
  private onForbidden?: (error: any) => void | Promise<void>;
  private onResponseError?: (error: any) => void | Promise<void>;

  constructor(options: IpcClientOptions = {}) {
    this.getSessionId = options.getSessionId;
    this.requireAuth = options.requireAuth ?? false;
    this.onUnauthorized = options.onUnauthorized;
    this.onForbidden = options.onForbidden;
    this.onResponseError = options.onResponseError;
  }

  async request<T = unknown>(config: IpcRequestConfig): Promise<T> {
    try {
      let payload = config.payload;

      if (this.requireAuth) {
        const sessionId = this.getSessionId?.();
        if (!sessionId) {
          const err = new Error('Token o sessionId no encontrado');
          (err as any).code = 'UNAUTHORIZED';
          throw err;
        }

        // Inyectamos el sessionId en el payload, ya que el backend (withAuth) lo espera así
        if (payload && typeof payload === 'object') {
          payload = { ...payload, sessionId };
        } else {
          payload = { sessionId };
        }
      }

      const ipc = typeof window !== 'undefined' ? (window.api || (window as any).ipcRenderer) : undefined;
      if (!ipc || typeof ipc.invoke !== 'function') {
        throw new Error('API IPC de Electron no disponible. Asegúrate de ejecutar la app dentro de Electron.');
      }

      const response: any = await ipc.invoke(config.channel, payload);

      if (!response || typeof response !== 'object' || !('ok' in response)) {
          return response as T;
      }
      
      if (!response.ok) {
        throw response.error || new Error(`IPC Request failed for channel: ${config.channel}`);
      }

      return response as T;
    } catch (error: any) {
      await this.onResponseError?.(error);

      const code = error?.code || error?.error?.code;
      const message = String(error?.message || error?.error?.message || error || '');
      
      const isUnauthorized = 
        code === 'SESSION_INVALID' || 
        code === 'SESSION_EXPIRED' || 
        code === 'UNAUTHORIZED' ||
        message.includes('No session provided') ||
        message.includes('Token o sessionId no encontrado') ||
        message.includes('Session invalid') ||
        message.includes('Session expired');

      if (isUnauthorized) {
        await this.onUnauthorized?.(error);
        notifyUnauthorized(error);
      }
      
      if (code === 'ACCESS_DENIED' || code === 'FORBIDDEN') {
        await this.onForbidden?.(error);
        notifyForbidden(error);
      }

      throw error;
    }
  }
}
