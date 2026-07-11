import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";

export interface TreatmentProps {
  treatmentId: string;
  entryId: string;
  name: string;
  description?: string | null;
  frequency?: string | null;
  objective?: string | null;
  startDate: string;
  endDate?: string | null;
  deletedAt?: string | null;
}

export type TreatmentCreate = Omit<TreatmentProps, 'treatmentId' | 'deletedAt'>;

export class Treatment {
  protected readonly treatmentId: string;
  protected readonly entryId: string;
  protected name: string;
  protected description: string | null;
  protected frequency: string | null;
  protected objective: string | null;
  protected startDate: string;
  protected endDate: string | null;

  constructor(props: TreatmentProps) {
    this.treatmentId = props.treatmentId;
    this.entryId = props.entryId;
    this.name = Treatment.validateName(props.name);
    this.description = props.description || null;
    this.frequency = props.frequency || null;
    this.objective = props.objective || null;
    this.startDate = props.startDate;
    this.endDate = props.endDate || null;
  }

  static validateName(name: string): string {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new Error('El nombre del tratamiento es inválido');
    }
    return name.trim();
  }

  static register(props: TreatmentCreate): Treatment {
    return new Treatment({
      treatmentId: UuidHandler.idCreator(),
      ...props
    });
  }

  update(data: Partial<Omit<TreatmentProps, 'treatmentId' | 'entryId' | 'deletedAt'>>) {
    if (data.name !== undefined) this.name = Treatment.validateName(data.name);
    if (data.description !== undefined) this.description = data.description || null;
    if (data.frequency !== undefined) this.frequency = data.frequency || null;
    if (data.objective !== undefined) this.objective = data.objective || null;
    if (data.startDate !== undefined) this.startDate = data.startDate;
    if (data.endDate !== undefined) this.endDate = data.endDate || null;
  }

  toPersistence() {
    return {
      treatment_id: this.treatmentId,
      entry_id: this.entryId,
      name: this.name,
      description: this.description || undefined,
      frequency: this.frequency || undefined,
      objective: this.objective || undefined,
      start_date: this.startDate,
      end_date: this.endDate || undefined
    };
  }

  toDTO() {
    return {
      treatmentId: this.treatmentId,
      entryId: this.entryId,
      name: this.name,
      description: this.description,
      frequency: this.frequency,
      objective: this.objective,
      startDate: this.startDate,
      endDate: this.endDate
    };
  }
}
