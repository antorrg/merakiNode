import { describe, it, expect, beforeAll, afterAll} from 'vitest'
import envConfig from './envConfig.js'
import { db, startUp, closeDatabase } from './database.js'


describe('EnvDb test', () => { 
  beforeAll(async() => {
    await startUp(true)
  })
  afterAll(async() => {
    await closeDatabase()
  })
  describe('Environment variables', () => {
    it('should return the correct environment status and database variable', () => { 
      const formatEnvInfo = `App running in: ${envConfig.Status}`+
      `Testing database: ${nameOfDb(envConfig.DatabasePath)}`
      expect(formatEnvInfo).toBe(
        'App running in: test'+
        'Testing database: database.test.sqlite'
      )
    })
  })
  describe('Database existence', () => {
    it('should query tables and return an empty array', async() => { 
      const models = [  'users', 'clients', 'vehicles',  'work_orders', 'services', 'order_services']
      for (const model of models) {
            const dataSql = `
                    SELECT *
                    FROM ${model}
                  `;
    const records = db.db.prepare(dataSql).all() ;
        expect(Array.isArray(records)).toBe(true)
        expect(records.length).toBe(0)
      }
    })
  })
})

function nameOfDb (url:string): string {
  if (!url) return 'unknown'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'unknown'
}