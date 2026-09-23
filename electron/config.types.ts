export interface PdfConfig {
  fontSize: 'sm' | 'md' | 'lg';
  showLinkedDiagnoses: boolean;
  showDiagnosisSummary: boolean;
  showObservations: boolean;
  showTreatmentPlan: boolean;
  showRecommendations: boolean;
  customHeaderNotes?: string;
  logoUrl?: string | null;
  institutionName?: string;
}

export interface BackupConfig {
  enabled: boolean;
  frequencyDays: number;
  maxRetentionFiles: number;
  lastBackupDate?: string | null;
}

export interface AppConfig {
  appName?: string;
  shortName?: string;
  legalName?: string;
  logoUrl?: string | null;
  phone?: string;
  email?: string;
  address?: string;
  customHeaderNotes?: string;
  pdf: PdfConfig;
  backup: BackupConfig;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Espacio Medico Integral',
  shortName: 'Medical',
  legalName: 'Espacio Medico Integral',
  logoUrl: '/medicalLogo.png',
  phone: '',
  email: '',
  address: '',
  customHeaderNotes: '',
  pdf: {
    fontSize: 'md',
    showLinkedDiagnoses: true,
    showDiagnosisSummary: true,
    showObservations: true,
    showTreatmentPlan: true,
    showRecommendations: true,
    customHeaderNotes: '',
    logoUrl: '/medicalLogo.png',
    institutionName: 'Espacio Medico Integral',
  },
  backup: {
    enabled: true,
    frequencyDays: 1,
    maxRetentionFiles: 10,
    lastBackupDate: null,
  },
};
