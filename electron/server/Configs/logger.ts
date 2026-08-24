import pino, { type Logger as PinoLogger } from 'pino'
import envConfig from './envConfig.js'
import { fileTransport, rotatingFileStream } from './Logger/transports/fileTransport.js'
import { dbWritableStream } from './Logger/transports/dbTransport.js'

let logger: PinoLogger

switch (envConfig.Status) {
  case 'test':
    // Pretty print en consola, simple
    logger = pino({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    })
    break

  case 'development': // dev
    // Guardar logs en archivo
    logger = pino({
      level: 'info',
      transport: fileTransport()
    })
    break

  case 'production': {
    // 1. Operaciones (info, warn, error, fatal) a la Base de Datos SQLite
    const dbStream = dbWritableStream()

    // 2. Archivo rotativo diario de información: sistemLogs/info-YYYY-MM-DD.log (retención de 30 días)
    const infoFileStream = rotatingFileStream({
      prefix: 'info',
      dirPath: envConfig.SistemLogsDir,
      maxDays: 30
    })

    // 3. Archivo rotativo diario de errores: sistemLogs/error-YYYY-MM-DD.log (retención de 30 días)
    const errorFileStream = rotatingFileStream({
      prefix: 'error',
      dirPath: envConfig.SistemLogsDir,
      maxDays: 30
    })

    logger = pino(
      { level: 'info' },
      pino.multistream([
        { level: 'info', stream: dbStream },
        { level: 'info', stream: infoFileStream },
        { level: 'error', stream: errorFileStream }
      ])
    )
    break
  }

  default:
    logger = pino()
}

export default logger
