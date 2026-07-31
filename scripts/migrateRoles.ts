import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
const targetDbs = ['database.dev.sqlite', 'database.sqlite'];

function migrateDb(dbName: string) {
  const dbPath = path.join(dataDir, dbName);
  if (!fs.existsSync(dbPath)) {
    console.log(`ℹ️  Base de datos no encontrada en ${dbPath}, omitiendo...`);
    return;
  }

  console.log(`🔄 Migrando roles en ${dbPath}...`);
  const db = new Database(dbPath);

  try {
    db.exec('BEGIN TRANSACTION;');

    // 1. Actualizar roles en la tabla users
    const userAdminRes = db.prepare("UPDATE users SET role = 'PROFESIONAL' WHERE role = 'ADMIN'").run();
    const userUserRes = db.prepare("UPDATE users SET role = 'SECRETARIO' WHERE role = 'USER'").run();
    console.log(`  - Usuarios: ADMIN ➔ PROFESIONAL (${userAdminRes.changes} filas)` );
    console.log(`  - Usuarios: USER ➔ SECRETARIO (${userUserRes.changes} filas)`);

    // 2. Actualizar roles en la tabla sessions si existe
    const sessionTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'").get();
    if (sessionTable) {
      const sessAdminRes = db.prepare("UPDATE sessions SET role = 'PROFESIONAL' WHERE role = 'ADMIN'").run();
      const sessUserRes = db.prepare("UPDATE sessions SET role = 'SECRETARIO' WHERE role = 'USER'").run();
      console.log(`  - Sesiones: ADMIN ➔ PROFESIONAL (${sessAdminRes.changes} filas)`);
      console.log(`  - Sesiones: USER ➔ SECRETARIO (${sessUserRes.changes} filas)`);
    }

    db.exec('COMMIT;');
    console.log(`✅ Migración exitosa en ${dbName}!`);
  } catch (error) {
    db.exec('ROLLBACK;');
    console.error(`❌ Error migrando ${dbName}:`, error);
  } finally {
    db.close();
  }
}

targetDbs.forEach(migrateDb);
