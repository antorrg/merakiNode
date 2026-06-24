import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startUp, closeDatabase } from '../database.js'
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js'
import { LoggerServiceSqlite } from './LoggerServiceSqlite.js'

describe('LoggerServiceSqlite Integration (SQLite)', () => {
  beforeAll(async () => {
    // Reinicia y sincroniza las tablas para pruebas en un DB real de test
    await startUp(true, true)
  })

  afterAll(async () => {
    // Cierra la conexión para no bloquear archivos
    await closeDatabase()
  })

  it('should store and retrieve contexts as array and support CRUD', async () => {
    const repo = new BaseRepository('logs', 'id', false, true)
    const payload = {
      levelName: 'Error',
      levelCode: 50,
      message: 'Integration test error',
      type: 'Test',
      status: 500,
      stack: 'stacktrace',
      contexts: JSON.stringify(['ctx1', 'ctx2']),
      pid: process.pid,
      time: Date.now(),
      hostname: 'testhost',
      keep: false
    }

    const created = repo.create(payload)
    expect(created).toBeDefined()
    const id = Number(created.results)
    expect(id).toBeGreaterThan(0)

    const service = new LoggerServiceSqlite()

    const all = await service.getAll({ page: 1, limit: 10 })
    expect(all.info.total).toBeGreaterThanOrEqual(1)

    const found = all.results.find(r => r.id === id)
    expect(found).toBeDefined()
    expect(found?.contexts).toEqual(['ctx1', 'ctx2'])

    const byId = await service.getById(id)
    expect(byId.contexts).toEqual(['ctx1', 'ctx2'])

    const updated = await service.update(id, { keep: true })
    expect(updated.results.keep).toBe(true)

    const deletedMsg = await service.delete(id)
    expect(typeof deletedMsg).toBe('string')
  })

  it('deleteAll should remove non-kept logs', async () => {
    const repo = new BaseRepository('logs', 'id', false, true)

    // create one kept and one not kept
    repo.create({ levelName: 'Info', levelCode: 30, message: 'keep me', contexts: JSON.stringify([]), pid: process.pid, time: Date.now(), hostname: 'h', keep: true })
    repo.create({ levelName: 'Info', levelCode: 30, message: 'delete me', contexts: JSON.stringify([]), pid: process.pid, time: Date.now(), hostname: 'h', keep: false })

    const service = new LoggerServiceSqlite()
    const before = await service.getAll({ page: 1, limit: 20 })
    expect(before.info.total).toBeGreaterThanOrEqual(2)

    await service.deleteAll()

    const after = await service.getAll({ page: 1, limit: 20 })
    // only kept logs remain
    const remaining = after.results
    expect(remaining.every(r => r.keep === true)).toBe(true)
  })
})
