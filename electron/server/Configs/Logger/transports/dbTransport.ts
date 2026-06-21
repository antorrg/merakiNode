import { Writable } from 'stream'
import { Log } from '../../database.js'

function dbTransport () {
  return async function saveToDb (logObject: Record<string, any>) {
    try {
      // Si el transport envía strings, parseamos. Si es objeto, lo usamos directo.
      const obj = typeof logObject === 'string'
        ? JSON.parse(logObject)
        : logObject

      // Filtramos logs de error / fatal (>= 50)
      //console.log(normalizedLog(obj))
      if (obj?.level >= 50) {
        await Log.create(normalizedLog(obj))
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
    async write (chunk, enc, next) {
      try {
        await handler(chunk)
        next()
      } catch (err: any) {
        next(err)
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
const normalizedLog = (log:any)=>({
  levelName: levelToText(log.level),//string
  levelCode: log.level,//number
  message: log.msg, //string
  type: log.err?.type ?? null,     // 👈 Aquí
  status: log.err?.status ?? null,//number
  stack: log.err?.stack ?? null, //jsonb
  contexts: log.err?.contexts ?? [],//string
  pid: log.pid,//number
  time:log.time,//number
  hostname: log.hostname //string
});