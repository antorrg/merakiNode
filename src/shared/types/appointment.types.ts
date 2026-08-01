export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface IAppointment {
  appointmentId: string;
  patientId: string;
  professionalId: string;
  service: string;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes?: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  professionalName?: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  professionalId: string;
  service: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentStatusInput {
  appointmentId: string;
  status: AppointmentStatus;
  notes?: string;
}
