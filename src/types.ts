
export enum Role {
  SECRETARIO = "SECRETARIO",
  PROFESIONAL = "PROFESIONAL",
  PROPIETARIO = "PROPIETARIO",
}
export interface IUser {
    userId:string
    userEmail:string
    userName:string
    nickname:string
    role: Role
    enabled:boolean
    createdAt:string
    updatedAt:string
}
export type Guardian = {
  relationId?: string;
  guardianId?: string;
  isPrimary: boolean;
  name: string;
  phone: string;
  relationship: string;
  isPatient?: boolean;
}
export interface IPatient {
    patientId:string
    firstName:string
    lastName:string
    typeDoc:string
    identityCode:string
    guardians?: Guardian[] | []
    birthDate: string
    age: number
    address: string
    city: string
    email?: string
    phone?: string
    ownEmail?: string | null
    ownPhone?: string | null
    obraSocial?: string
    escolaridad?: string
    isPatient?: boolean
}

export enum VisitType {
  PRESENTIAL = 'PRESENTIAL',
  VIRTUAL = 'VIRTUAL',
  PHONE = 'PHONE',
  REPORT = 'REPORT'
}

export interface IHistoryEntry {
  entryId: string;
  patientId: string;
  professionalId: string;
  visitType: VisitType;
  visitDate: string;
  reason: string;
  diagnosisSummary?: string | null;
  observations?: string | null;
  evolution?: string | null;
  treatmentPlan?: string | null;
  recommendations?: string | null;
  diagnosisIds?: string[]; // Para el frontend: array de IDs vinculados
}

export enum DiagnosisStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  CHRONIC = 'CHRONIC',
  SUSPENDED = 'SUSPENDED'
}

export interface IDiagnosis {
  diagnosisId: string;
  patientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  status: DiagnosisStatus;
}

export interface ITreatment {
  treatmentId: string;
  entryId: string;
  name: string;
  description?: string | null;
  frequency?: string | null;
  objective?: string | null;
  startDate: string;
  endDate?: string | null;
}
