import { throwError } from '../../Configs/Errors/ErrorHandler.js';
import { ErrorCode } from '../../Configs/Errors/errorCode.js';
import { SessionRepository } from './SessionRepository.js';
import { UserService } from '../user/UserService.js';
import { Session, SessionData } from '../../Shared/Auth/Session.js';

export class AuthService {
  constructor(
    private sessionRepository: SessionRepository,
    private userService: UserService
  ) {}

  /**
   * Autentica al usuario usando credenciales y genera una sesión stateful.
   */
  async login(data: { email: string; password: string }, rolling: boolean = true) {
    const user = await this.userService.authenticate(data.email, data.password);
    if (!user) throwError('Invalid email or password', ErrorCode.ACCESS_DENIED);

    const sessionData: SessionData = {
      userId: user!.userId,
      username: user!.nickname || user!.name || user!.email.split('@')[0],
      role: user!.role
    };

    const session = Session.createSession(sessionData, rolling);
    
    const saved = this.sessionRepository.saveSession(session);
    if (!saved) throwError('Could not save session', ErrorCode.INTERNAL_ERROR);

    return {
      user: user,
      session: session.toClient()
    };
  }

  /**
   * Verifica la sesión entrante, renueva expiración si es rolling y devuelve datos de la sesión.
   * Opcionalmente valida si el usuario cumple con el rol requerido.
   */
  async verifyService(sessionId: string, requiredRole?: string) {
    const session = this.sessionRepository.findSession(sessionId);
    if (!session) throwError('Session not found', ErrorCode.SESSION_INVALID);

    const isValid = session!.verify();
    
    if (!isValid) {
      this.sessionRepository.deleteSession(sessionId);
      throwError('Session expired', ErrorCode.SESSION_EXPIRED);
    }

    if (requiredRole && !session!.hasAccess(requiredRole)) {
      throwError('Insufficient permissions', ErrorCode.ACCESS_DENIED);
    }

    // Si verify extendió el tiempo (por ser rolling), actualizamos DB/Caché
    this.sessionRepository.updateSession(session!);

    return session!.toClient();
  }

  /**
   * Cierra sesión destruyendo e invalidando el sessionId explícitamente.
   */
  async logout(sessionId: string) {
    const session = this.sessionRepository.findSession(sessionId);
    if (session) {
      session.destroy();
      this.sessionRepository.deleteSession(sessionId);
    }
    return true;
  }
}

