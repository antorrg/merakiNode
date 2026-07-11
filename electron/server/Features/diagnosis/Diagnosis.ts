import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";

export enum DiagnosisStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  CHRONIC = 'CHRONIC',
  SUSPENDED = 'SUSPENDED'
}

export interface DiagnosisProps {
  diagnosisId: string;
  patientId: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string | null;
  status: DiagnosisStatus;
  deletedAt?: string | null;
}

export type DiagnosisCreate = Omit<DiagnosisProps, 'diagnosisId' | 'deletedAt'>;

export class Diagnosis {
  protected readonly diagnosisId: string;
  protected readonly patientId: string;
  protected title: string;
  protected description: string;
  protected startDate: string;
  protected endDate: string | null;
  protected status: DiagnosisStatus;

  constructor(props: DiagnosisProps) {
    this.diagnosisId = props.diagnosisId;
    this.patientId = props.patientId;
    this.title = Diagnosis.validateTitle(props.title);
    this.description = props.description;
    this.startDate = props.startDate;
    this.endDate = props.endDate || null;
    this.status = props.status;
  }

  static validateTitle(title: string): string {
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      throw new Error('El título del diagnóstico es inválido');
    }
    return title.trim();
  }

  static register(props: DiagnosisCreate): Diagnosis {
    return new Diagnosis({
      diagnosisId: UuidHandler.idCreator(),
      ...props
    });
  }

  update(data: Partial<Pick<DiagnosisProps, 'title' | 'description' | 'status' | 'endDate'>>) {
    if (data.title !== undefined) this.title = Diagnosis.validateTitle(data.title);
    if (data.description !== undefined) this.description = data.description;
    if (data.status !== undefined) this.status = data.status;
    if (data.endDate !== undefined) this.endDate = data.endDate;
  }

  resolve(endDate: string) {
    this.status = DiagnosisStatus.RESOLVED;
    this.endDate = endDate;
  }

  toPersistence() {
    return {
      diagnosis_id: this.diagnosisId,
      patient_id: this.patientId,
      title: this.title,
      description: this.description,
      start_date: this.startDate,
      end_date: this.endDate || undefined,
      status: this.status
    };
  }

  toDTO() {
    return {
      diagnosisId: this.diagnosisId,
      patientId: this.patientId,
      title: this.title,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status
    };
  }
}
