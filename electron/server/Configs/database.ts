import envConfig from './envConfig.js'
import { SqliteDb, Table } from './dbConfigs/DatabaseClient.js'
import logger from './logger.js'

const nameOfDb = (): string => {
  const url = envConfig.DatabasePath
  if (!url) return 'unknown'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'unknown'
}

import { users, patients, patient_relations, history_entry,  diagnosis, treatment, sessions, log, entry_diagnoses, appointments, pdf_exports } from '../Schema/schema.js'

// Aquí puedes definir tus esquemas de tabla para auto-crearse si no existen
const initialTables: Table[] = [
  users,
  patients,
  patient_relations,
  history_entry,
  diagnosis,
  treatment,
  sessions,
  log,
  entry_diagnoses,
  appointments,
  pdf_exports
]

// Calculamos la ruta. Si estamos en test usamos memoria RAM pura para mayor velocidad.
const dbPath = envConfig.DatabasePath

const db = new SqliteDb(dbPath, initialTables)

import Database from 'better-sqlite3'

async function startUp (syncing: boolean= false, reset: boolean = false){
  const messageRestart:string = `🔄 Restarting database "${nameOfDb()}" for testing...`
  const messageExec:string = '🧪  Database testing setup executed'
  const messageSuccess:string = `🟢 Database SQLite initialized successfully at ${nameOfDb()}!!`
  try {
    if (!db.db || !db.db.open) {
      db.db = new Database(dbPath)
      db.db.pragma('foreign_keys = ON')
      db.db.pragma('journal_mode = WAL')
    }

    if(syncing=== true && reset === true){
      logger.info(messageRestart)
      console.log(messageRestart)
      db.sync({ force: true })
      logger.info(messageExec)
      console.log(messageExec)
    } else if(syncing=== true){
      // Sincroniza (crea) las tablas definidas en initialTables si no existen
      db.sync()
    }
    
    // Verificamos que la conexión funciona (síncrono)
    db.authenticate()
    logger.info(messageSuccess)
    console.log(messageSuccess)
  } catch (error) {
    logger.error(error)
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
