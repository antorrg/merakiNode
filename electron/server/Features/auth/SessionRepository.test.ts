import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { db, startUp, closeDatabase } from '../../Configs/database.js'
import { SessionRepository } from './SessionRepository.js'
import { Session, SessionProp } from '../../Shared/Auth/Session.js'

type SessionRow = {
  session_id: string;
  user_id: string;
  username: string;
  role: string;
  created_at: number;
  expires_at: number;
  rolling: number;
}

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}))

describe('SessionRepository', () => {
  let repository: SessionRepository;

  beforeAll(async () => {
    // Creamos la tabla síncronamente antes de arrancar los tests usando el schema real
    await startUp(true, true);
    
    // Insertar un usuario dummy para cumplir con el FOREIGN KEY de sessions
    db.db.prepare(`
      INSERT INTO users (user_id, user_email, password, role)
      VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d470', 'test@test.com', 'password1234567890123', 'ADMIN')
    `).run();
  })

  beforeEach(() => {
    // Instanciamos uno nuevo para limpiar la memoria caché entre pruebas
    repository = new SessionRepository();
    // Limpiamos la base de datos
    db.db.exec(`DELETE FROM sessions;`);
  })

  afterAll(async () => {
    // Borramos la tabla para no dejar basura en la base de memoria
    await closeDatabase();
  })

  const createDummySession = (id: string, expiresAt: number) => {
    const prop: SessionProp = {
      sessionId: id,
      userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d470',
      username: 'testuser',
      role: 'ADMIN',
      createdAt: Date.now(),
      expiresAt: expiresAt,
      rolling: true
    }
    return new Session(prop);
  }

  it('debería guardar una sesión tanto en DB como en memoria caché', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d471';
    const session = createDummySession(id, Date.now() + 10000);
    const result = repository.saveSession(session);
    
    expect(result).toBe(true);

    // Verificar en la DB directamente
    const row = db.db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(id) as SessionRow;
    expect(row).toBeDefined();
    expect(row.session_id).toBe(id);
    expect(row.rolling).toBe(1); // SQLite guarda booleanos como 1/0
    
    // Verificar que también lo encuentra por su método, y que viene de la caché.
    const foundSession = repository.findSession(id);
    expect(foundSession).not.toBeNull();
    expect(foundSession?.toJSON().sessionId).toBe(id);
  })

  it('debería encontrar una sesión usando solo la memoria caché si ya fue guardada', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d472';
    const session = createDummySession(id, Date.now() + 10000);
    repository.saveSession(session);
    
    // Borramos de la DB directamente para forzar que solo responda la memoria caché
    db.db.exec(`DELETE FROM sessions WHERE session_id = '${id}';`);
    
    // Debería seguir encontrándolo ya que saveSession lo puso en el Map de memoria
    const foundSession = repository.findSession(id);
    
    expect(foundSession).not.toBeNull();
    expect(foundSession?.toJSON().sessionId).toBe(id);
  })

  it('debería encontrar una sesión en DB y cachearla si no está en memoria', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d473';
    const session = createDummySession(id, Date.now() + 10000);
    
    // Lo guardamos directamente en DB, esquivando la memoria caché de nuestro repo
    db.db.prepare(`
      INSERT INTO sessions (session_id, user_id, username, role, created_at, expires_at, rolling) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.toJSON().sessionId, 
      session.toJSON().userId, 
      session.toJSON().username, 
      session.toJSON().role, 
      session.toJSON().createdAt, 
      session.toJSON().expiresAt, 
      1
    );

    // Lo buscamos, debería ir a DB y encontrarlo
    const foundSession = repository.findSession(id);
    expect(foundSession).not.toBeNull();
    expect(foundSession?.toJSON().sessionId).toBe(id);

    // Ahora borramos de DB. Como ya lo buscó, debería estar en la memoria caché.
    db.db.exec(`DELETE FROM sessions WHERE session_id = '${id}';`);

    const cachedSession = repository.findSession(id);
    expect(cachedSession).not.toBeNull();
    expect(cachedSession?.toJSON().sessionId).toBe(id);
  })

  it('debería retornar null si la sesión no existe en ningún lado', () => {
    const result = repository.findSession('f47ac10b-58cc-4372-a567-0e02b2c3d474');
    expect(result).toBeNull();
  })

  it('debería actualizar la fecha de expiración de una sesión en memoria y DB', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d475';
    const session = createDummySession(id, Date.now() + 10000);
    repository.saveSession(session);

    const newExpiresAt = Date.now() + 50000;
    const updatedSessionData = session.toJSON();
    updatedSessionData.expiresAt = newExpiresAt;
    
    const updatedSession = new Session(updatedSessionData);
    
    const updateResult = repository.updateSession(updatedSession);
    expect(updateResult).toBe(true);

    // Verificar en la DB
    const row = db.db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(id) as SessionRow;
    expect(row.expires_at).toBe(newExpiresAt);

    // Verificar en la memoria caché
    const foundSession = repository.findSession(id);
    expect(foundSession?.toJSON().expiresAt).toBe(newExpiresAt);
  })

  it('debería eliminar una sesión de memoria y DB', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d476';
    const session = createDummySession(id, Date.now() + 10000);
    repository.saveSession(session);

    const deleteResult = repository.deleteSession(id);
    expect(deleteResult).toBe(true);

    // Verificar en la DB
    const row = db.db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(id) as SessionRow | undefined;
    expect(row).toBeUndefined();

    // Verificar en la memoria caché
    const foundSession = repository.findSession(id);
    expect(foundSession).toBeNull();
  })

  it('debería limpiar las sesiones expiradas usando cleanupExpired', async () => {
    const now = Date.now();
    
    const expiredId = 'f47ac10b-58cc-4372-a567-0e02b2c3d477';
    const validId = 'f47ac10b-58cc-4372-a567-0e02b2c3d478';

    // Una que expira en 100ms y otra en 10000ms
    const expiredSession = createDummySession(expiredId, now + 100);
    const validSession = createDummySession(validId, now + 10000);
    
    repository.saveSession(expiredSession);
    repository.saveSession(validSession);

    // Esperar a que expire la primera sesión (150ms)
    await new Promise(resolve => setTimeout(resolve, 150));

    const deletedCount = repository.cleanupExpired();
    // Dependiendo de cómo lo maneje db.run().changes esto podría ser 1.
    expect(deletedCount).toBe(1);

    // Validar en DB
    const expiredRow = db.db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(expiredId) as SessionRow | undefined;
    const validRow = db.db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(validId) as SessionRow | undefined;
    
    expect(expiredRow).toBeUndefined();
    expect(validRow).toBeDefined();

    // Validar en la caché
    expect(repository.findSession(expiredId)).toBeNull();
    expect(repository.findSession(validId)).not.toBeNull();
  })
})
