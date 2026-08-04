import { authService } from "../dependencies.js";
import { throwError } from "../../Configs/Errors/ErrorHandler.js";
import { ErrorCode } from "../../Configs/Errors/errorCode.js";
import { type SessionProp } from "../Auth/Session.js";
import type { AuthenticatedPayload } from "../../ipc/ipc.types.js";

export interface InjectUserOptions {
  field?: string;
  condition?: 'always' | 'ifMissing' | 'ifNonOwner' | 'ifRole';
  role?: string;
}

export class IpcMiddlewares {
  /**
   * Middleware para IPC Handlers en Electron.
   * Verifica si la sesión es válida y, opcionalmente, si el usuario tiene un rol determinado.
   */
  static withAuth = <P = unknown, R = unknown>(
    handler: (event: unknown, data: P) => Promise<R> | R,
    requiredRole?: string
  ) => {
    return async (event: unknown, data: SessionProp) => {
      if (!data || !data.sessionId) {
        throwError('No session provided', ErrorCode.ACCESS_DENIED);
      }

      const sessionData = await authService.verifyService(data.sessionId, requiredRole);

      return handler(event, { ...data, sessionClient: sessionData } as P);
    };
  };

  /**
   * Inyecta de forma segura el userId del usuario autenticado en el objeto payload (por defecto en 'professionalId')
   * según la condición configurada ('always', 'ifMissing', 'ifNonOwner', 'ifRole').
   */
  static injectSessionUserId<T>(
    data: AuthenticatedPayload<T>,
    options: InjectUserOptions = {}
  ): AuthenticatedPayload<T> {
    const { field = 'professionalId', condition = 'always', role } = options;
    const userId = data?.sessionClient?.userId;
    const userRole = data?.sessionClient?.role;

    if (!data || !userId) return data;

    const target = data as Record<string, unknown>;
    let shouldInject = false;

    switch (condition) {
      case 'always':
        shouldInject = true;
        break;
      case 'ifMissing':
        shouldInject = !target[field];
        break;
      case 'ifNonOwner':
        shouldInject = userRole !== 'PROPIETARIO';
        break;
      case 'ifRole':
        shouldInject = userRole === role && !target[field];
        break;
    }

    if (shouldInject) {
      target[field] = userId;
    }

    return data;
  }

  /**
   * Garantiza que ningún usuario pueda actualizar el perfil o recurso de otro usuario.
   * Sin importar el rol del usuario autenticado, solo se permite modificar su propio perfil.
   * Si en el payload se especifica un userId distinto al del usuario autenticado, arroja error ACCESS_DENIED.
   * Si no se especifica userId en el payload, inyecta su propio userId de la sesión.
   */
  static selfGuard<T>(
    data: AuthenticatedPayload<T>,
    targetField: string = 'userId'
  ): AuthenticatedPayload<T> {
    const sessionUser = data?.sessionClient;
    if (!sessionUser || !sessionUser.userId) {
      throwError('No session provided', ErrorCode.ACCESS_DENIED);
      return data;
    }

    const currentUserId = sessionUser.userId;
    const target = data as Record<string, unknown>;
    const targetUserId = target[targetField] as string | undefined;

    if (targetUserId && targetUserId !== currentUserId) {
      throwError('Acceso denegado: solo puedes modificar tu propio perfil', ErrorCode.ACCESS_DENIED);
    }

    if (!targetUserId) {
      target[targetField] = currentUserId;
    }

    return data;
  }
}