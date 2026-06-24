import { Writable } from 'stream'
import { BaseRepository } from '../../../Shared/Repositories/BaseRepository.js'
import { Logs } from '../../../dbTypes/db.types.js'

export interface PinoLog {
  level: number;
  msg: string;
  pid: number;
  time: number;
  hostname: string;
  err?: {
    type?: string;
    status?: number;
    stack?: string;
    contexts?: unknown[];
  };
  [key: string]: unknown;
}

const repo = new BaseRepository<Logs, Omit<Logs, 'id'|'created_at'|'updated_at'>, Partial<Logs>>('logs', 'id', false, false)
function dbTransport () {
  return async function saveToDb (logObject: string | PinoLog) {
    try {
      // Si el transport envía strings, parseamos. Si es objeto, lo usamos directo.
      const obj = (typeof logObject === 'string'
        ? JSON.parse(logObject)
        : logObject) as PinoLog

      // Filtramos logs de error / fatal (>= 50)
      if (obj?.level >= 50) {
        repo.create(normalizedLog(obj))
      }
    } catch (error) {
      console.error('Error guardando log en DB:', error)
    }
  }
}

export function dbWritableStream () {
  const handler = dbTransport()

  return new Writable({
    objectMode: true,
    async write (chunk, _enc, next) {
      try {
        await handler(chunk)
        next()
      } catch (err: unknown) {
        next(err instanceof Error ? err : new Error(String(err)))
      }
    }
  })
}

const pinoLevels: Record<number, string> = {
  10: 'Trace',
  20: 'Debug',
  30: 'Info',
  40: 'Warn',
  50: 'Error',
  60: 'Fatal'
};

export function levelToText(level: number) {
  return pinoLevels[level] ?? 'unknown';
}

const normalizedLog = (log: PinoLog): Omit<Logs, 'id'|'created_at'|'updated_at'> => ({
  level_name: levelToText(log.level),
  level_code: log.level,
  message: log.msg,
  type: log.err?.type ?? undefined,
  status: log.err?.status ?? undefined,
  stack: log.err?.stack ?? undefined,
  contexts: JSON.stringify(log.err?.contexts ?? []),
  pid: log.pid,
  time: log.time,
  hostname: log.hostname,
  keep: false
});