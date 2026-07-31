import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db, startUp, closeDatabase } from '../../Configs/database.js';
import { userService } from '../../Shared/dependencies.js';
import authIndex from './auth.index.js';

describe('auth.index integration tests', () => {
  beforeAll(async () => {
    await startUp(true);
  });

  beforeEach(() => {
    db.db.exec('DELETE FROM sessions;');
    db.db.exec('DELETE FROM users;');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('debería verificar que inicialmente no existen usuarios', async () => {
    const hasUsers = await authIndex.checkUsers();
    expect(hasUsers).toBe(false);
  });

  it('debería crear el usuario inicial (OWNER) y luego permitir checkUsers', async () => {
    const ownerData = {
      email: 'owner@meraki.com',
      username: 'adminOwner'
    };

    const created = await authIndex.createInitialOwner(ownerData);
    expect(created).toBeDefined();
    expect(created.userEmail).toBe('owner@meraki.com');
    expect(created.role).toBe('PROPIETARIO');

    const hasUsersAfter = await authIndex.checkUsers();
    expect(hasUsersAfter).toBe(true);
  });

  it('debería hacer login correctamente, obtener la sesión y cerrar sesión (logout)', async () => {
    await userService.createUser({
      userEmail: 'login@meraki.com',
      userName: 'loginUser',
      password: 'password123456',
      role: 'ADMIN'
    });

    const loginResponse = await authIndex.login({
      email: 'login@meraki.com',
      password: 'password123456'
    });

    expect(loginResponse).toBeDefined();
    expect(loginResponse.user.userEmail).toBe('login@meraki.com');
    expect(loginResponse.session).toBeDefined();
    expect(loginResponse.session.sessionId).toBeDefined();

    const sessionId = loginResponse.session.sessionId;

    const sessionData = await authIndex.getSession(sessionId);
    expect(sessionData).toBeDefined();
    expect(sessionData.sessionId).toBe(sessionId);
    expect(sessionData.userName).toBe('loginUser');

    const logoutResult = await authIndex.logout(sessionId);
    expect(logoutResult).toBe(true);

    await expect(authIndex.getSession(sessionId)).rejects.toThrow();
  });

  it('debería fallar el login con un formato de email inválido (validación de esquema)', async () => {
    await expect(
      authIndex.login({
        email: 'invalid-email-format',
        password: 'somepassword'
      })
    ).rejects.toThrow();
  });
});
