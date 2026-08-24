import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { BackupService } from './BackupService.js';
import { configService } from '../configuration/ConfigService.js';
import { startUp, closeDatabase, db } from '../../Configs/database.js';

describe('BackupService', () => {
  const testBackupsDir = path.resolve(process.cwd(), 'temp_test_backups');
  let backupService: BackupService;

  beforeAll(async () => {
    await startUp(true, true);
    if (fs.existsSync(testBackupsDir)) {
      fs.rmSync(testBackupsDir, { recursive: true, force: true });
    }
    backupService = new BackupService(testBackupsDir);
  });

  afterAll(async () => {
    await closeDatabase();
    if (fs.existsSync(testBackupsDir)) {
      fs.rmSync(testBackupsDir, { recursive: true, force: true });
    }
  });

  it('should generate dynamic app slug from config appName/shortName without meraki fallback if overridden', () => {
    configService.saveConfig({ appName: 'Clínica Médica San Martín', shortName: 'San Martín' });
    const slug = backupService.getAppSlug();
    expect(slug).toBe('san_martin');

    configService.saveConfig({ appName: 'Centro Médico Alpha', shortName: '' });
    const slug2 = backupService.getAppSlug();
    expect(slug2).toBe('centro_medico_alpha');
  });

  it('should create online sqlite backup file with dynamic name appSlug_backup_YYYY-MM-DD.sqlite', async () => {
    configService.saveConfig({ appName: 'Centro de Salud Norte', shortName: 'Salud Norte' });
    const backupPath = await backupService.createBackup();

    expect(fs.existsSync(backupPath)).toBe(true);

    const filename = path.basename(backupPath);
    expect(filename).toMatch(/^salud_norte_backup_\d{4}-\d{2}-\d{2}\.sqlite$/);

    const config = configService.getConfig();
    expect(config.backup.lastBackupDate).toBeDefined();
  });

  it('should correctly determine shouldRunBackup based on frequencyDays', () => {
    const today = new Date().toISOString().split('T')[0];

    // Si nunca se hizo backup (null), debe correr
    expect(backupService.shouldRunBackup(null, 1)).toBe(true);

    // Si se hizo hoy y la frecuencia es 1 día, NO debe correr aún hoy
    expect(backupService.shouldRunBackup(today, 1)).toBe(false);

    // Si se hizo hace 2 días y la frecuencia es 1 día, SÍ debe correr
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    expect(backupService.shouldRunBackup(twoDaysAgo, 1)).toBe(true);

    // Si se hizo hace 2 días y la frecuencia es 5 días, NO debe correr aún
    expect(backupService.shouldRunBackup(twoDaysAgo, 5)).toBe(false);
  });

  it('should cleanup old backup files exceeding maxRetentionFiles', () => {
    // Asegurar directorio limpio para esta prueba
    if (fs.existsSync(testBackupsDir)) {
      fs.rmSync(testBackupsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testBackupsDir, { recursive: true });

    // Crear 5 archivos simulados con mtimes crecientes bien diferenciados
    const now = Date.now();
    for (let i = 1; i <= 5; i++) {
      const file = path.join(testBackupsDir, `app_backup_2026-08-0${i}.sqlite`);
      fs.writeFileSync(file, `dummy content ${i}`);
      const mtime = new Date(now - (5 - i) * 100000);
      fs.utimesSync(file, mtime, mtime);
    }

    expect(fs.readdirSync(testBackupsDir).length).toBe(5);

    // Retener máximo 3
    const deletedCount = backupService.cleanupOldBackups(3);
    expect(deletedCount).toBe(2);

    const remaining = fs.readdirSync(testBackupsDir);
    expect(remaining.length).toBe(3);
    expect(remaining).toContain('app_backup_2026-08-05.sqlite');
    expect(remaining).toContain('app_backup_2026-08-04.sqlite');
    expect(remaining).toContain('app_backup_2026-08-03.sqlite');
  });

  it('should execute maintenance purgings non-kept logs and running VACUUM', () => {
    // Insert test logs
    const stmt = db.db.prepare(`
      INSERT INTO logs (level_name, level_code, message, pid, keep, created_at, time)
      VALUES ('Info', 30, 'Old log', 1234, 0, '2020-01-01 00:00:00', 1577836800000)
    `);
    stmt.run();

    const result = backupService.runMaintenance(30);
    expect(result.logsDeleted).toBeGreaterThanOrEqual(1);
    expect(result.vacuumExecuted).toBe(true);
  });
});
