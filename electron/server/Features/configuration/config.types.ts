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

export interface AppConfig {
  appName?: string;
  pdf: PdfConfig;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'Meraki Espacio Integral',
  pdf: {
    fontSize: 'md',
    showLinkedDiagnoses: true,
    showDiagnosisSummary: true,
    showObservations: true,
    showTreatmentPlan: true,
    showRecommendations: true,
    customHeaderNotes: '',
    logoUrl: '/medicalLogo.png',
    institutionName: 'Meraki Espacio Integral',
  },
};

