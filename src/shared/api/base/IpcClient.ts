export interface IpcRequestConfig {
  channel: string;
  payload?: any;
}

interface IpcClientOptions {
  getSessionId?: () => string | null | undefined;
  requireAuth?: boolean;
  onUnauthorized?: (error: any) => void | Promise<void>;
  onForbidden?: (error: any) => void | Promise<void>;
  onResponseError?: (error: any) => void | Promise<void>;
}

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
          throw new Error('Token o sessionId no encontrado');
        }

        // Inyectamos el sessionId en el payload, ya que el backend (withAuth) lo espera así
        if (payload && typeof payload === 'object') {
          payload = { ...payload, sessionId };
        } else {
          // Si el payload está vacío o no es un objeto
          payload = { sessionId };
        }
      }

      const response = await window.ipcRenderer.invoke(config.channel, payload);

      if (!response || typeof response !== 'object' || !('ok' in response)) {
          // Si por alguna razón la respuesta no viene envuelta en { ok, data, error },
          // simplemente retornamos la data cruda.
          return response as T;
      }
      
      if (!response.ok) {
        throw response.error || new Error(`IPC Request failed for channel: ${config.channel}`);
      }

      return response as T;
    } catch (error: any) {
      await this.onResponseError?.(error);

      const code = error?.code || error?.error?.code;
      if (code === 'SESSION_INVALID' || code === 'SESSION_EXPIRED' || code === 'UNAUTHORIZED') {
        await this.onUnauthorized?.(error);
      }
      
      if (code === 'ACCESS_DENIED' || code === 'FORBIDDEN') {
        await this.onForbidden?.(error);
      }

      throw error;
    }
  }
}
