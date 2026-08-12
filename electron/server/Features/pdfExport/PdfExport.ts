export interface PdfExportProps {
  id: string;
  patientId: string;
  userId: string;
  fileName: string;
  relativePath: string;
  visitIds: string[];
  documentType: string;
  createdAt?: string;
}

export interface Guardian {
  name: string;
  relationship?: string;
}

export interface PatientData {
  firstName: string;
  lastName: string;
  typeDoc?: string;
  identityCode?: string;
  birthDate?: string;
  age?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  obraSocial?: string;
  escolaridad?: string;
  guardians?: Guardian[];
}

export interface ProfessionalData {
  userName: string;
  userEmail: string;
  role?: string;
}

export type FontSizeMode = 'sm' | 'md' | 'lg';

export interface PdfConfig {
  fontSize?: FontSizeMode;
  showLinkedDiagnoses?: boolean;
  showDiagnosisSummary: boolean;
  showObservations: boolean;
  showTreatmentPlan: boolean;
  showRecommendations: boolean;
  customHeaderNotes?: string;
  logoUrl?: string | null;
  institutionName?: string;
}

export interface DraftEntry {
  entryId: string;
  patientId?: string;
  professionalId?: string;
  visitType: string;
  visitDate: string;
  reason?: string;
  linkedDiagnosesText?: string;
  evolution?: string;
  diagnosisSummary?: string;
  observations?: string;
  treatmentPlan?: string;
  recommendations?: string;
}

export interface GeneratePdfPayload {
  patientId: string;
  patientData: PatientData;
  professionalData: ProfessionalData;
  pdfConfig: PdfConfig;
  draftEntries: DraftEntry[];
}

