import React from 'react';
import  IdentityTab  from '../IdentityTab';
import  PdfConfigTab  from '../PdfConfigTab';
import  BackupConfigTab  from '../BackupConfigTab';
import  SystemLogsPanel  from '../SystemLogsPanel';
import  GeneralTab  from '../GeneralTab';

export interface TabItem {
  nameKey: string;
  text: string;
  component: React.ComponentType;
}

export const tabsData: TabItem[] = [
  { nameKey: 'identity', text: '🏢 Identidad y Marca', component: IdentityTab },
  { nameKey: 'pdf', text: '📄 Documentos y PDFs', component: PdfConfigTab },
  { nameKey: 'backup', text: '💾 Copias de Seguridad (Backups)', component: BackupConfigTab },
  { nameKey: 'logs', text: '📜 Registros del Sistema (Logs)', component: SystemLogsPanel },
  { nameKey: 'general', text: '⚙️ General y Sistema', component: GeneralTab },
];
