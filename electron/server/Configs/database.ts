import envConfig from './envConfig.js'
import { SqliteDb, Table } from './dbConfigs/DatabaseClient.js'

const nameOfDb = (): string => {
  const url = envConfig.DatabasePath
  if (!url) return 'unknown'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'unknown'
}

import { users, patients, history_entry,  diagnosis, treatment, sessions } from '../Schema/schema.js'

// Aquí puedes definir tus esquemas de tabla para auto-crearse si no existen
const initialTables: Table[] = [
  users,
  patients,
  history_entry,
  diagnosis,
  treatment,
  sessions
]

// Calculamos la ruta. Si estamos en test usamos memoria RAM pura para mayor velocidad.
const dbPath = envConfig.DatabasePath

const db = new SqliteDb(dbPath, initialTables)

async function startUp (syncing: boolean= false, reset: boolean = false){
  try {
    if(syncing=== true && reset === true){
      console.log(`🔄 Restarting database "${nameOfDb()}" for testing...`)
      db.sync({ force: true })
      console.log('🧪  Database testing setup executed')
    } else if(syncing=== true){
      // Sincroniza (crea) las tablas definidas en initialTables si no existen
      db.sync()
    }
    
    // Verificamos que la conexión funciona (síncrono)
    db.authenticate()
    console.log(`🟢​  Database SQLite initialized successfully at ${dbPath}!!`)
  } catch (error) {
    console.error('❌ Error starting database: ', error)
  }
}

async function closeDatabase() {
  try {
    // Cerramos la conexión a la base de datos (síncrono)
    db.db.close()
    console.log(`🛑 Database SQLite disconnected successfully.`)
  } catch (error) {
    console.error('❌ Error closing database:', error)
  }
}

export {
    db,
    startUp,
    closeDatabase
}
/*  // 1. validar DB
  await pool.query('SELECT 1')
  console.log('🟢 Database ready')*/