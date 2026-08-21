import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { AppConfig, DEFAULT_APP_CONFIG } from './config.types.js';

export class ConfigService {
  private configPath: string;

  constructor() {
    let baseDir: string;
    try {
      baseDir = app ? app.getPath('userData') : process.cwd();
    } catch {
      baseDir = process.cwd();
    }
    this.configPath = path.join(baseDir, 'config.json');
  }

  public getConfig(): AppConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.writeConfigFile(DEFAULT_APP_CONFIG);
        return DEFAULT_APP_CONFIG;
      }
      const rawData = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(rawData);
      return {
        ...DEFAULT_APP_CONFIG,
        ...parsed,
        pdf: {
          ...DEFAULT_APP_CONFIG.pdf,
          ...(parsed.pdf || {}),
        },
      };
    } catch (error) {
      console.error('Error al leer config.json, usando valores por defecto:', error);
      return DEFAULT_APP_CONFIG;
    }
  }

  public saveConfig(newConfig: Partial<AppConfig>): AppConfig {
    try {
      const current = fs.existsSync(this.configPath) ? this.getConfig() : DEFAULT_APP_CONFIG;
      const updatedAppName = newConfig.appName !== undefined ? newConfig.appName : current.appName;
      const updatedShortName = newConfig.shortName !== undefined ? newConfig.shortName : current.shortName;
      const updatedLegalName = newConfig.legalName !== undefined ? newConfig.legalName : current.legalName;
      const updatedLogoUrl = newConfig.logoUrl !== undefined ? newConfig.logoUrl : current.logoUrl;
      const updatedPhone = newConfig.phone !== undefined ? newConfig.phone : current.phone;
      const updatedEmail = newConfig.email !== undefined ? newConfig.email : current.email;
      const updatedAddress = newConfig.address !== undefined ? newConfig.address : current.address;
      const updatedCustomHeaderNotes = newConfig.customHeaderNotes !== undefined ? newConfig.customHeaderNotes : current.customHeaderNotes;

      const updated: AppConfig = {
        ...current,
        ...newConfig,
        appName: updatedAppName,
        shortName: updatedShortName,
        legalName: updatedLegalName,
        logoUrl: updatedLogoUrl,
        phone: updatedPhone,
        email: updatedEmail,
        address: updatedAddress,
        customHeaderNotes: updatedCustomHeaderNotes,
        pdf: {
          ...current.pdf,
          ...(newConfig.pdf || {}),
          institutionName: newConfig.pdf?.institutionName || updatedAppName || current.pdf.institutionName,
          logoUrl: newConfig.pdf?.logoUrl !== undefined ? newConfig.pdf.logoUrl : updatedLogoUrl,
          customHeaderNotes: newConfig.pdf?.customHeaderNotes !== undefined ? newConfig.pdf.customHeaderNotes : updatedCustomHeaderNotes,
        },
      };

      this.writeConfigFile(updated);
      return updated;
    } catch (error) {
      console.error('Error al guardar config.json:', error);
      throw new Error('No se pudo guardar la configuración del sistema');
    }
  }

  private writeConfigFile(config: AppConfig): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}

export const configService = new ConfigService();
