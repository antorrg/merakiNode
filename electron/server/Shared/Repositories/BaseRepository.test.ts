import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { db } from '../../Configs/database.js'
import { BaseRepository } from './BaseRepository.js'

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}))

// 1. Definimos los tipos para nuestra entidad de prueba
type TestEntity = { id: number; name: string }
type TestCreate = { name: string }
type TestUpdate = { name: string }

// 2. Extendemos BaseRepository para nuestra tabla de prueba
class TestRepository extends BaseRepository<TestEntity, TestCreate, TestUpdate> {
  constructor() {
    // Le pasamos el nombre de la tabla
    super('test_entity')
  }
}

describe('BaseRepository (SQLite Integration)', () => {
  const repository = new TestRepository()

  // 3. Setup de la base de datos
  beforeAll(() => {
    // Creamos la tabla síncronamente antes de arrancar los tests
    db.db.exec(`
      CREATE TABLE IF NOT EXISTS test_entity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );
    `)
  })

  // Limpiamos al terminar
  afterAll(() => {
    // Borramos la tabla para no dejar basura en la base de memoria
    db.db.exec(`DROP TABLE IF EXISTS test_entity;`)
  })

  // 4. Casos de prueba
  it('debería crear una nueva entidad', () => {
    const response = repository.create({ name: 'Entidad de prueba' })
    
    // El repo debería devolver un IResponse
    expect(response).toBeDefined()
    expect(response.message).toContain('Created in test_entity')
    // El results del create contiene el ID como string
    expect(typeof response.results).toBe('string')
    expect(parseInt(response.results as string)).toBeGreaterThan(0)
  })

  it('debería poder obtener una entidad por su id', () => {
    // Creamos otra entidad para asegurar que la obtenemos
    const createdRes = repository.create({ name: 'Para buscar' })
    const id = createdRes.results as string
    
    const foundRes = repository.getById(id)
    
    expect(foundRes).toBeDefined()
    expect(foundRes.results).not.toBeNull()
    expect((foundRes.results as TestEntity)?.name).toBe('Para buscar')
  })

  it('debería traer todas las entidades', () => {
    const allRes = repository.getAll()
    expect(Array.isArray(allRes.results)).toBe(true)
    // Ya creamos 2 en los tests anteriores, así que debe haber mínimo 2
    expect((allRes.results as any[]).length).toBeGreaterThanOrEqual(2)
  })

  it('debería actualizar una entidad existente', () => {
    const createdRes = repository.create({ name: 'A actualizar' })
    const id = createdRes.results as string
    
    const updatedRes = repository.update(id, { name: 'Actualizado' })
    
    // Retorna el registro actualizado por el RETURNING *
    expect((updatedRes.results as TestEntity)?.name).toBe('Actualizado')
    
    // Confirmamos llamando a la db de nuevo
    const foundRes = repository.getById(id)
    expect((foundRes.results as TestEntity)?.name).toBe('Actualizado')
  })

  it('debería borrar una entidad', () => {
    const createdRes = repository.create({ name: 'Para borrar' })
    const id = createdRes.results as string
    
    // Borramos
    const deleteRes = repository.delete(id)
    // La operación DELETE devuelve changes convertidos a string
    expect(deleteRes.results).toBe('1') 
    
    // Verificamos que ya no existe (getById devuelve null)
    const foundRes = repository.getById(id)
    expect(foundRes.results).toBeNull()

    // Verificamos que update de una entidad borrada retorne null
    const updateRes = repository.update(id, { name: 'Falla' })
    expect(updateRes.results).toBeNull()
  })
})
