import fs from 'fs'
import path from 'path'
import { Writable } from 'stream'

export function fileTransport (dest: string = './logs/app.log') {
  return {
    target: 'pino-pretty',
    options: {
      colorize: false,
      destination: dest,
      mkdir: true
    }
  }
}

export interface RotatingFileOptions {
  prefix: string
  dirPath: string
  maxDays?: number
}

function formatDate (date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function cleanupOldLogs (dirPath: string, prefix: string, maxDays: number): void {
  try {
    if (!fs.existsSync(dirPath)) return

    const files = fs.readdirSync(dirPath)
    const now = Date.now()
    const maxAgeMs = maxDays * 24 * 60 * 60 * 1000
    const pattern = new RegExp(`^${prefix}-\\d{4}-\\d{2}-\\d{2}\\.log$`)

    for (const file of files) {
      if (pattern.test(file)) {
        const filePath = path.join(dirPath, file)
        const stats = fs.statSync(filePath)
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath)
        }
      }
    }
  } catch (err) {
    console.error(`Error cleaning up old log files for ${prefix}:`, err)
  }
}

export function rotatingFileStream (options: RotatingFileOptions): Writable {
  const { prefix, dirPath, maxDays = 30 } = options

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  let currentDate = formatDate()
  let currentFilePath = path.join(dirPath, `${prefix}-${currentDate}.log`)
  let writeStream = fs.createWriteStream(currentFilePath, { flags: 'a' })

  cleanupOldLogs(dirPath, prefix, maxDays)

  return new Writable({
    objectMode: true,
    write (chunk, _encoding, next) {
      try {
        const today = formatDate()

        if (today !== currentDate) {
          currentDate = today
          writeStream.end()
          currentFilePath = path.join(dirPath, `${prefix}-${currentDate}.log`)
          writeStream = fs.createWriteStream(currentFilePath, { flags: 'a' })
          cleanupOldLogs(dirPath, prefix, maxDays)
        }

        let data: string
        if (typeof chunk === 'string') {
          data = chunk.endsWith('\n') ? chunk : `${chunk}\n`
        } else if (Buffer.isBuffer(chunk)) {
          const str = chunk.toString('utf-8')
          data = str.endsWith('\n') ? str : `${str}\n`
        } else {
          data = `${JSON.stringify(chunk)}\n`
        }

        writeStream.write(data, (err) => {
          if (err) return next(err)
          next()
        })
      } catch (err) {
        next(err instanceof Error ? err : new Error(String(err)))
      }
    },
    final (next) {
      writeStream.end(next)
    }
  })
}

