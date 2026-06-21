import { authService } from "../dependencies.js";
import { throwError } from "../../Configs/Errors/ErrorHandler.js";
import { ErrorCode } from "../../Configs/Errors/errorCode.js";

/**
 * Middleware para IPC Handlers en Electron.
 * Verifica si la sesión es válida y, opcionalmente, si el usuario tiene un rol determinado.
 * 
 * @param handler La función manejadora de IPC original.
 * @param requiredRole Nivel o nombre de rol mínimo (ej: 'MODERATOR' o 'ADMIN').
 */
export const withAuth = (handler: Function, requiredRole?: string) => {
    return async (event: any, data: any) => {
        // En Electron comúnmente mandamos el sessionId en el payload
        if (!data || !data.sessionId) {
            throwError('No session provided', ErrorCode.ACCESS_DENIED);
        }

        // Si la sesión expiró o no cumple el rol, verifyService arrojará error
        const sessionData = await authService.verifyService(data.sessionId, requiredRole);

        // Pasamos los datos al handler original, inyectando el sessionData limpio
        return handler(event, { ...data, sessionClient: sessionData });
    }
}