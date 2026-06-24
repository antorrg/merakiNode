import { db } from '../../Configs/database.js';
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { Session, SessionProp } from '../../Shared/Auth/Session.js';

import { Sessions } from '../../dbTypes/db.types.js';

export class SessionRepository {
  // Composición: SessionRepository "tiene un" BaseRepository en lugar de "ser un" BaseRepository
  private readonly base: BaseRepository<SessionProp, Sessions, Partial<Sessions>>;
  private readonly tableName = 'sessions';

  constructor() {
    // Le pasamos el nombre de la tabla y la columna clave primaria ("session_id")
    this.base = new BaseRepository<SessionProp, Sessions, Partial<Sessions>>(this.tableName, 'session_id');
  }
  /**
   * Caché en memoria para las sesiones, provee un acceso mucho más rápido.
   * Usamos un Map en lugar de un Array para búsquedas, inserciones y borrados en O(1)
   */
  #sessionStore: Map<string, SessionProp> = new Map();

  /**
   * Guarda una nueva sesión localmente y en la base de datos delegando en BaseRepository
   */
  saveSession(session: Session): boolean {
    const data = session.toJSON();
    
    const sessionDataToSave: Sessions = {
      session_id: data.sessionId,
      user_id: data.userId,
      username: data.username,
      role: data.role,
      created_at: data.createdAt,
      expires_at: data.expiresAt,
      rolling: data.rolling
    };

    // Guardamos la sesión localmente (caché)
    this.#sessionStore.set(data.sessionId, data);

    // Usamos el método genérico del BaseRepository
    const response = this.base.create(sessionDataToSave);
    
    return response !== null;
  }

  /**
   * Busca una sesión por su ID usando la memoria caché primero, 
   * si no existe se busca a través de BaseRepository y se guarda en caché.
   */
  findSession(sessionId: string): Session | null {
    // Buscar primero localmente
    let result: SessionProp | undefined | null = this.#sessionStore.get(sessionId);

    // Si no está localmente, buscar en la base de datos
    if (!result) {
      const response = this.base.getById(sessionId);
      result = response.results as SessionProp | null;

      // Si se encuentra en la base de datos, la guardamos en la memoria local (caché)
      if (result) {
        this.#sessionStore.set(result.sessionId, result);
      }
    }

    if (!result) return null;

    // Reconstruimos el objeto para la clase Session
    const sessionProp: SessionProp = {
      sessionId: result.sessionId,
      userId: result.userId,
      username: result.username,
      role: result.role,
      createdAt: result.createdAt,
      expiresAt: result.expiresAt,
      rolling: result.rolling
    };

    return new Session(sessionProp);
  }

  /**
   * Actualiza la sesión (usado cuando verify() renueva una sesión rolling) en memoria y DB.
   */
  updateSession(session: Session): boolean {
    const data = session.toJSON();
    
    // Actualizamos localmente en memoria
    const localSession = this.#sessionStore.get(data.sessionId);
    if (localSession) {
      localSession.expiresAt = data.expiresAt;
    }

    // Solo actualizamos lo necesario a través del BaseRepository
    const updateData: Partial<Sessions> = {
      expires_at: data.expiresAt
    };
    
    const response = this.base.update(data.sessionId, updateData);
    return response.results !== null;
  }

  /**
   * Elimina una sesión explícitamente de la memoria y usando BaseRepository
   */
  deleteSession(sessionId: string): boolean {
    // Eliminar de memoria local
    this.#sessionStore.delete(sessionId);

    // Eliminar de la base de datos
    const response = this.base.delete(sessionId);
    return parseInt(response.results as string) > 0;
  }

  /**
   * Métodos ultra-específicos del dominio que BaseRepository no maneja:
   * Limpia todas las sesiones que ya expiraron, en memoria local y en la DB.
   */
  cleanupExpired(): number {
    const now = Date.now();
    
    // Limpiar de la memoria local
    for (const [id, session] of this.#sessionStore.entries()) {
      if (session.expiresAt < now) {
        this.#sessionStore.delete(id);
      }
    }

    // Como BaseRepository no tiene "deleteWhere", aquí hacemos la query manual
    const stmt = db.db.prepare(`
      DELETE FROM ${this.tableName}
      WHERE expires_at < ?
    `);
    
    const result = stmt.run(now);
    return result.changes;
  }
}
