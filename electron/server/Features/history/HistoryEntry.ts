import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";

export enum VisitType {
  PRESENTIAL = 'PRESENTIAL',
  VIRTUAL = 'VIRTUAL',
  PHONE = 'PHONE',
  REPORT = 'REPORT'
}

export interface HistoryEntryProps {
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
  deletedAt?: string | null;
}

export type HistoryEntryCreate = Omit<HistoryEntryProps, 'entryId' | 'deletedAt'>;

export class HistoryEntry {
  protected readonly entryId: string;
  protected readonly patientId: string;
  protected readonly professionalId: string;
  protected visitType: VisitType;
  protected visitDate: string;
  protected reason: string;
  protected diagnosisSummary: string | null;
  protected observations: string | null;
  protected evolution: string | null;
  protected treatmentPlan: string | null;
  protected recommendations: string | null;

  constructor(props: HistoryEntryProps) {
    this.entryId = props.entryId;
    this.patientId = props.patientId;
    this.professionalId = props.professionalId;
    this.visitType = props.visitType;
    this.visitDate = props.visitDate;
    this.reason = HistoryEntry.validateReason(props.reason);
    this.diagnosisSummary = props.diagnosisSummary || null;
    this.observations = props.observations || null;
    this.evolution = props.evolution || null;
    this.treatmentPlan = props.treatmentPlan || null;
    this.recommendations = props.recommendations || null;
  }

  static validateReason(reason: string): string {
    if (!reason || typeof reason !== 'string' || reason.trim().length < 2) {
      throw new Error('El motivo de consulta es inválido');
    }
    return reason.trim();
  }

  static register(props: HistoryEntryCreate): HistoryEntry {
    return new HistoryEntry({
      entryId: UuidHandler.idCreator(),
      ...props
    });
  }

  update(data: Partial<Omit<HistoryEntryProps, 'entryId' | 'patientId' | 'professionalId' | 'deletedAt'>>) {
    console.dir('data para actualizar en el domain: ', data)
    if (data.visitType !== undefined) this.visitType = data.visitType;
    if (data.visitDate !== undefined) this.visitDate = data.visitDate;
    if (data.reason !== undefined) this.reason = HistoryEntry.validateReason(data.reason);
    if (data.diagnosisSummary !== undefined) this.diagnosisSummary = data.diagnosisSummary || null;
    if (data.observations !== undefined) this.observations = data.observations || null;
    if (data.evolution !== undefined) this.evolution = data.evolution || null;
    if (data.treatmentPlan !== undefined) this.treatmentPlan = data.treatmentPlan || null;
    if (data.recommendations !== undefined) this.recommendations = data.recommendations || null;
  }

  toPersistence() {
    return {
      entry_id: this.entryId,
      patient_id: this.patientId,
      professional_id: this.professionalId,
      visit_type: this.visitType,
      visit_date: this.visitDate,
      reason: this.reason,
      diagnosis_summary: this.diagnosisSummary || null,
      observations: this.observations || null,
      evolution: this.evolution || null,
      treatment_plan: this.treatmentPlan || null,
      recommendations: this.recommendations || null
    };
  }

  toDTO() {
    return {
      entryId: this.entryId,
      patientId: this.patientId,
      professionalId: this.professionalId,
      visitType: this.visitType,
      visitDate: this.visitDate,
      reason: this.reason,
      diagnosisSummary: this.diagnosisSummary,
      observations: this.observations,
      evolution: this.evolution,
      treatmentPlan: this.treatmentPlan,
      recommendations: this.recommendations
    };
  }
}
