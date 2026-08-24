import fs from 'node:fs';
import path from 'node:path';
import { db } from '../../Configs/database.js';
import envConfig from '../../Configs/envConfig.js';
import { configService } from '../configuration/ConfigService.js';
import logger from '../../Configs/logger.js';

export class BackupService {
  private backupsDir: string;

  constructor(customBackupsDir?: string) {
    this.backupsDir = customBackupsDir || envConfig.BackupsDir;
  }

  public getAppSlug(): string {
    const config = configService.getConfig();
    const rawName = config.shortName || config.appName || 'app';
    return rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'app';
  }

  public async createBackup(): Promise<string> {
    try {
      if (!fs.existsSync(this.backupsDir)) {
        fs.mkdirSync(this.backupsDir, { recursive: true });
      }

      const today = new Date();
      const dateStr = this.formatDate(today);
      const appSlug = this.getAppSlug();
      const filename = `${appSlug}_backup_${dateStr}.sqlite`;
      const destinationPath = path.join(this.backupsDir, filename);

      logger.info(`🔄 Iniciando backup automático de la base de datos en: ${filename}`);

      // Backup en caliente usando la API nativa de better-sqlite3
      await db.db.backup(destinationPath);

      // Actualizar fecha de último backup en la configuración
      const currentConfig = configService.getConfig();
      configService.saveConfig({
        backup: {
          ...currentConfig.backup,
          lastBackupDate: dateStr,
        },
      });

      logger.info(`🟢 Backup completado exitosamente: ${filename}`);

      // Limpiar respaldos antiguos
      this.cleanupOldBackups(currentConfig.backup.maxRetentionFiles || 10);

      return destinationPath;
    } catch (error) {
      logger.error(`❌ Error al crear backup de la base de datos: ${error}`);
      console.error('Error al crear backup:', error);
      throw error;
    }
  }

  public async runScheduledBackupCheck(): Promise<boolean> {
    try {
      const config = configService.getConfig();
      const backupCfg = config.backup;

      if (!backupCfg || !backupCfg.enabled) {
        logger.info('ℹ️ Backups automáticos desactivados en la configuración.');
        return false;
      }

      if (this.shouldRunBackup(backupCfg.lastBackupDate, backupCfg.frequencyDays)) {
        await this.createBackup();
        return true;
      }

      logger.info('ℹ️ El backup aún no corresponde según la frecuencia configurada.');
      return false;
    } catch (error) {
      logger.error(`❌ Error durante la verificación programada de backup: ${error}`);
      return false;
    }
  }

  public shouldRunBackup(lastBackupDate?: string | null, frequencyDays: number = 1): boolean {
    if (!lastBackupDate) return true;

    const parts = lastBackupDate.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return true;

    const [lastY, lastM, lastD] = parts;
    const lastDate = new Date(lastY, lastM - 1, lastD);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= frequencyDays;
  }

  public cleanupOldBackups(maxRetentionFiles: number = 10): number {
    try {
      if (!fs.existsSync(this.backupsDir)) return 0;

      const files = fs.readdirSync(this.backupsDir);
      const backupFiles = files
        .filter((file) => file.endsWith('.sqlite') && file.includes('_backup_'))
        .map((file) => {
          const filePath = path.join(this.backupsDir, file);
          const stats = fs.statSync(filePath);
          return { file, filePath, mtime: stats.mtimeMs };
        })
        .sort((a, b) => b.mtime - a.mtime); // Más nuevos primero

      if (backupFiles.length <= maxRetentionFiles) return 0;

      const filesToDelete = backupFiles.slice(maxRetentionFiles);
      let deletedCount = 0;

      for (const item of filesToDelete) {
        fs.unlinkSync(item.filePath);
        deletedCount++;
        logger.info(`🧹 Backup antiguo eliminado por retención: ${item.file}`);
      }

      return deletedCount;
    } catch (error) {
      logger.error(`❌ Error al limpiar backups antiguos: ${error}`);
      return 0;
    }
  }

  public runMaintenance(daysToKeepLogs: number = 60): { logsDeleted: number; vacuumExecuted: boolean } {
    try {
      logger.info('🛠️ Iniciando mantenimiento de base de datos (purga de logs + VACUUM)...');

      // Purga de logs no marcados como 'keep' mayores a N días
      const cutoffMs = Date.now() - daysToKeepLogs * 24 * 60 * 60 * 1000;
      const stmt = db.db.prepare(`
        DELETE FROM logs 
        WHERE (keep = 0 OR keep IS NULL) 
          AND (time < ? OR created_at < date('now', '-${daysToKeepLogs} days'))
      `);
      const info = stmt.run(cutoffMs);

      // Ejecución de VACUUM para recuperar espacio libre en disco
      db.db.exec('VACUUM;');

      logger.info(`🟢 Mantenimiento completado. Registros de logs eliminados: ${info.changes}, VACUUM ejecutado.`);

      return {
        logsDeleted: info.changes,
        vacuumExecuted: true,
      };
    } catch (error) {
      logger.error(`❌ Error durante el mantenimiento de la base de datos: ${error}`);
      throw error;
    }
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

export const backupService = new BackupService();
