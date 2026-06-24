import { Table } from '../Configs/dbConfigs/DatabaseClient.js';

export const users: Table = {
  name: 'users',
  sql: `CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nickname TEXT,
    user_name TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  deps: []
};

export const patients: Table = {
  name: 'patients',
  sql: `CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    type_doc TEXT,
    identity_code TEXT,
    birth_date TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  );`,
  deps: []
};

export const patient_relations: Table = {
  name: 'patient_relations',
  sql: `CREATE TABLE IF NOT EXISTS patient_relations (
    relation_id TEXT PRIMARY KEY,
    guardian_id TEXT NOT NULL,
    dependent_id TEXT NOT NULL,
    relationship_type TEXT,
    is_primary_contact BOOLEAN DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(guardian_id) REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(dependent_id) REFERENCES patients(patient_id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  deps: ['patients']
};

export const history_entry: Table = {
  name: 'history_entry',
  sql: `CREATE TABLE IF NOT EXISTS history_entry (
    history_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    userId TEXT NOT NULL,
    visit_date TEXT,
    reason TEXT,
    diagnosis TEXT,
    observations TEXT,
    evolution TEXT,
    tratment_plan TEXT,
    recomendations TEXT,
    professional_name TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE
  );`,
  deps: ['patients']
};

export const diagnosis:Table = {
  name: 'diagnosis',
  sql:`CREATE TABLE IF NOT EXISTS diagnosis (
  diagnosis_id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  status TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE
  );`,
  deps : ['patients']
}

export const treatment: Table = {
  name: 'treatment',
  sql: `CREATE TABLE IF NOT EXISTS treatment (
  treatment_id TEXT PRIMARY KEY,
  history_id TEXT NOT NULL,
  name TEXT,
  description TEXT,
  frequency TEXT,
  objective TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY(history_id) REFERENCES history_entry(history_id) ON UPDATE CASCADE
  );`,
  deps: ['history_entry']
}

export const sessions: Table = {
  name: 'sessions',
  sql: `CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL,
  created_at INTEGER, 
  expires_at INTEGER,
  rolling BOOLEAN DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );`,
  deps: ['users']
}