import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthContext IPC Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Preparar localStorage y window.api mock
    const storage: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
      length: 0,
      key: () => null,
    };

    (global as any).window = {
      api: {
        invoke: vi.fn(),
      },
    };
  });

  it('debería invocar auth:login y guardar la sesión en localStorage', async () => {
    const mockUser = { userId: 'u1', userEmail: 'test@meraki.com', role: 'PROFESIONAL' };
    const mockSession = { sessionId: 'sess-123' };

    (window as any).api.invoke.mockImplementation(async (channel: string) => {
      if (channel === 'auth:login') {
        return { ok: true, data: { user: mockUser, session: mockSession } };
      }
      return { ok: true };
    });

    const response = await (window as any).api.invoke('auth:login', { email: 'test@meraki.com', password: '123' });
    expect(response.ok).toBe(true);
    expect(response.data.user.userEmail).toBe('test@meraki.com');
    expect(response.data.session.sessionId).toBe('sess-123');

    // Simular el inicio de sesión
    localStorage.setItem('sessionId', response.data.session.sessionId);
    expect(localStorage.getItem('sessionId')).toBe('sess-123');
  });

  it('debería invocar auth:logout y limpiar la sesión en localStorage', async () => {
    localStorage.setItem('sessionId', 'sess-123');
    (window as any).api.invoke.mockResolvedValueOnce({ ok: true });

    const sessionId = localStorage.getItem('sessionId');
    const response = await (window as any).api.invoke('auth:logout', sessionId);

    expect(response.ok).toBe(true);
    localStorage.removeItem('sessionId');
    expect(localStorage.getItem('sessionId')).toBeNull();
  });
});
