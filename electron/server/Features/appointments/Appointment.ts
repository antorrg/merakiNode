import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface AppointmentProps {
  appointmentId: string;
  patientId: string;
  professionalId: string;
  service: string;
  status: AppointmentStatus | string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AppointmentCreate = Omit<AppointmentProps, 'appointmentId' | 'status' | 'createdAt' | 'updatedAt'> & {
  status?: AppointmentStatus | string;
};

export class Appointment {
  protected readonly appointmentId: string;
  protected patientId: string;
  protected professionalId: string;
  protected service: string;
  protected status: AppointmentStatus;
  protected startTime: string;
  protected endTime: string;
  protected notes: string | null;
  protected createdBy: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;

  constructor(props: AppointmentProps) {
    this.appointmentId = props.appointmentId;
    this.patientId = props.patientId;
    this.professionalId = props.professionalId;
    this.service = props.service;
    this.status = (props.status as AppointmentStatus) || AppointmentStatus.PENDING;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.notes = props.notes ?? null;
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static register(data: AppointmentCreate): Appointment {
    if (!data.patientId || !data.professionalId || !data.service || !data.startTime || !data.endTime || !data.createdBy) {
      throw new Error('Parámetros obligatorios faltantes para el turno');
    }

    return new Appointment({
      appointmentId: UuidHandler.idCreator(),
      patientId: data.patientId,
      professionalId: data.professionalId,
      service: data.service,
      status: data.status || AppointmentStatus.CONFIRMED,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || null,
      createdBy: data.createdBy
    });
  }

  updateStatus(status: AppointmentStatus, notes?: string) {
    this.status = status;
    if (notes !== undefined) {
      this.notes = notes;
    }
  }

  toPersistence() {
    return {
      appointment_id: this.appointmentId,
      patient_id: this.patientId,
      professional_id: this.professionalId,
      service: this.service,
      status: this.status,
      start_time: this.startTime,
      end_time: this.endTime,
      notes: this.notes,
      created_by: this.createdBy
    };
  }

  toDTO() {
    return {
      appointmentId: this.appointmentId,
      patientId: this.patientId,
      professionalId: this.professionalId,
      service: this.service,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      notes: this.notes,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
