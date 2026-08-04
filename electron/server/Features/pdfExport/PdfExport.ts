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

export interface GeneratePdfPayload {
  patientId: string;
  patientData: {
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
    postalCode?: string;
    guardians?: { name: string; relationship?: string }[];
  };
  professionalData: {
    userName: string;
    userEmail: string;
    role?: string;
  };
  pdfConfig: {
    showLinkedDiagnoses?: boolean;
    showDiagnosisSummary: boolean;
    showObservations: boolean;
    showTreatmentPlan: boolean;
    showRecommendations: boolean;
    customHeaderNotes?: string;
    logoUrl?: string | null;
  };
  draftEntries: {
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
  }[];
}
