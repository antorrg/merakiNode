import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { rotatingFileStream } from './fileTransport.js'

describe('rotatingFileStream transport', () => {
  const testDir = path.resolve(process.cwd(), 'temp_test_sistemLogs')

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should create log file with prefix-YYYY-MM-DD.log format and write log chunk', async () => {
    const stream = rotatingFileStream({
      prefix: 'info',
      dirPath: testDir,
      maxDays: 30
    })

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const expectedFilename = `info-${yyyy}-${mm}-${dd}.log`
    const expectedFilePath = path.join(testDir, expectedFilename)

    await new Promise<void>((resolve, reject) => {
      stream.write({ level: 30, msg: 'Test info message' }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    await new Promise<void>((resolve) => stream.end(resolve))

    expect(fs.existsSync(expectedFilePath)).toBe(true)
    const content = fs.readFileSync(expectedFilePath, 'utf-8')
    expect(content).toContain('Test info message')
  })

  it('should remove log files older than maxDays', async () => {
    fs.mkdirSync(testDir, { recursive: true })

    const oldDateStr = '2020-01-01'
    const oldFilePath = path.join(testDir, `info-${oldDateStr}.log`)
    fs.writeFileSync(oldFilePath, 'old log content')

    // Modificamos mtime a una fecha antigua
    const pastTime = new Date('2020-01-01T00:00:00Z')
    fs.utimesSync(oldFilePath, pastTime, pastTime)

    expect(fs.existsSync(oldFilePath)).toBe(true)

    // Inicializar el stream dispara el cleanupOldLogs
    const stream = rotatingFileStream({
      prefix: 'info',
      dirPath: testDir,
      maxDays: 30
    })

    await new Promise<void>((resolve) => stream.end(resolve))

    // El archivo antiguo debió ser eliminado por superar 30 días
    expect(fs.existsSync(oldFilePath)).toBe(false)
  })
})
