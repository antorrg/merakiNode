import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { IpcClient } from './IpcClient';

describe('IpcClient', () => {
  beforeEach(() => {
    // Mock the window.api environment since we're in Vitest Node environment
    vi.stubGlobal('window', {
      api: {
        invoke: vi.fn(),
        on: vi.fn(),
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('llama al canal ipc correcto con el payload', async () => {
    const response = { ok: true, data: { success: true } };
    vi.mocked(window.api.invoke).mockResolvedValue(response);

    const client = new IpcClient();

    const result = await client.request({
      channel: 'test:channel',
      payload: { page: 1 }
    });

    expect(result).toEqual(response);
    expect(window.api.invoke).toHaveBeenCalledWith('test:channel', { page: 1 });
  });

  it('lanza el error cuando el backend responde ok: false', async () => {
    const errorResponse = { ok: false, error: { message: 'Error de prueba', code: 'TEST_ERROR' } };
    vi.mocked(window.api.invoke).mockResolvedValue(errorResponse);

    const client = new IpcClient();

    await expect(
      client.request({
        channel: 'test:channel'
      })
    ).rejects.toEqual(errorResponse.error);
  });

  it('ejecuta callbacks onUnauthorized cuando ocurre un error SESSION_EXPIRED', async () => {
    const errorResponse = { ok: false, error: { message: 'Expiró', code: 'SESSION_EXPIRED' } };
    vi.mocked(window.api.invoke).mockResolvedValue(errorResponse);

    const onUnauthorized = vi.fn();
    const client = new IpcClient({ onUnauthorized });

    await expect(
      client.request({ channel: 'test:private' })
    ).rejects.toBeDefined();

    expect(onUnauthorized).toHaveBeenCalledWith(errorResponse.error);
  });

  it('devuelve el objeto si la respuesta no tiene el formato {ok, data, error}', async () => {
    const rawResponse = { someOtherFormat: true };
    vi.mocked(window.api.invoke).mockResolvedValue(rawResponse);

    const client = new IpcClient();

    const result = await client.request({ channel: 'test:raw' });

    expect(result).toEqual(rawResponse);
  });
});

