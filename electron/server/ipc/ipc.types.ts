import { type SessionProp } from "../Shared/Auth/Session.js";
import type { GeneratePdfPayload as PdfDomainPayload } from "../Features/pdfExport/PdfExport.js";

/**
 * Cliente de sesión que se adjunta mediante la autenticación middleware con withAuth.
 */
export interface SessionClient
  extends Pick<SessionProp, 'sessionId' | 'userId' | 'userName' | 'role'> {}

export type UserRole = 'PROPIETARIO' | 'PROFESIONAL' | 'SECRETARIO' | string;

/**
 * Tipo genérico para cualquier carga útil de un handler IPC autenticado.
 */
export type AuthenticatedPayload<T = Record<string, unknown>> = T & {
  sessionId?: string;
  sessionClient?: SessionClient;
};

// ==========================================
// APPOINTMENT IPC PAYLOAD TYPES
// ==========================================
export interface CreateAppointmentParams {
  patientId: string;
  professionalId: string;
  service: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy?: string;
}
export type CreateAppointmentPayload = AuthenticatedPayload<CreateAppointmentParams>;

export interface GetAppointmentsByRangeParams {
  startDate: string;
  endDate: string;
  professionalId?: string;
}
export type GetAppointmentsByRangePayload = AuthenticatedPayload<GetAppointmentsByRangeParams>;

export interface GetAppointmentsByPatientParams {
  patientId: string;
}
export type GetAppointmentsByPatientPayload = AuthenticatedPayload<GetAppointmentsByPatientParams>;

export interface UpdateAppointmentStatusParams {
  appointmentId: string;
  status: string;
  notes?: string;
}
export type UpdateAppointmentStatusPayload = AuthenticatedPayload<UpdateAppointmentStatusParams>;

export interface DeleteAppointmentParams {
  appointmentId: string;
}
export type DeleteAppointmentPayload = AuthenticatedPayload<DeleteAppointmentParams>;

// ==========================================
// PATIENTS IPC PAYLOAD TYPES
// ==========================================
export interface RegisterPatientParams {
  firstName: string;
  lastName: string;
  typeDoc: string;
  identityCode: string;
  birthDate: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  obraSocial?: string;
  escolaridad?: string;
  isPatient?: number;
}
export type RegisterPatientPayload = AuthenticatedPayload<RegisterPatientParams>;

export interface GetPatientsParams {
  search?: string;
  page?: number;
  limit?: number;
}
export type GetPatientsPayload = AuthenticatedPayload<GetPatientsParams>;

export interface GetPatientByIdParams {
  patientId: string;
}
export type GetPatientByIdPayload = AuthenticatedPayload<GetPatientByIdParams>;

export interface GetByIdentityCodeParams {
  identityCode: string;
}
export type GetByIdentityCodePayload = AuthenticatedPayload<GetByIdentityCodeParams>;

export interface UpdatePatientContactParams {
  patientId: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  obraSocial?: string;
  escolaridad?: string;
  [key: string]: unknown;
}
export type UpdatePatientContactPayload = AuthenticatedPayload<UpdatePatientContactParams>;

export interface DeletePatientParams {
  patientId: string;
}
export type DeletePatientPayload = AuthenticatedPayload<DeletePatientParams>;

// ==========================================
// DIAGNOSIS IPC PAYLOAD TYPES
// ==========================================
export interface AddDiagnosisParams {
  patientId: string;
  diagnosisCode?: string;
  description: string;
  notes?: string;
}
export type AddDiagnosisPayload = AuthenticatedPayload<AddDiagnosisParams>;

export interface GetActiveDiagnosesParams {
  patientId: string;
}
export type GetActiveDiagnosesPayload = AuthenticatedPayload<GetActiveDiagnosesParams>;

export interface UpdateDiagnosisParams {
  diagnosisId: string;
  description?: string;
  notes?: string;
  status?: string;
}
export type UpdateDiagnosisPayload = AuthenticatedPayload<UpdateDiagnosisParams>;

export interface DeleteDiagnosisParams {
  diagnosisId: string;
}
export type DeleteDiagnosisPayload = AuthenticatedPayload<DeleteDiagnosisParams>;

// ==========================================
// TREATMENT IPC PAYLOAD TYPES
// ==========================================
export interface AddTreatmentParams {
  patientId: string;
  diagnosisId?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
export type AddTreatmentPayload = AuthenticatedPayload<AddTreatmentParams>;

export interface GetTreatmentsByPatientParams {
  patientId: string;
}
export type GetTreatmentsByPatientPayload = AuthenticatedPayload<GetTreatmentsByPatientParams>;

export interface UpdateTreatmentParams {
  treatmentId: string;
  name?: string;
  description?: string;
  status?: string;
}
export type UpdateTreatmentPayload = AuthenticatedPayload<UpdateTreatmentParams>;

export interface DeleteTreatmentParams {
  treatmentId: string;
}
export type DeleteTreatmentPayload = AuthenticatedPayload<DeleteTreatmentParams>;

// ==========================================
// HISTORY ENTRY IPC PAYLOAD TYPES
// ==========================================
export interface AddHistoryEntryParams {
  patientId: string;
  professionalId?: string;
  notes?: string;
  details?: string;
}
export type AddHistoryEntryPayload = AuthenticatedPayload<AddHistoryEntryParams>;

export interface GetPatientHistoryEntriesParams {
  patientId: string;
  professionalId?: string;
}
export type GetPatientHistoryEntriesPayload = AuthenticatedPayload<GetPatientHistoryEntriesParams>;

export interface UpdateHistoryEntryParams {
  entryId: string;
  notes?: string;
  details?: string;
}
export type UpdateHistoryEntryPayload = AuthenticatedPayload<UpdateHistoryEntryParams>;

export interface DeleteHistoryEntryParams {
  entryId: string;
}
export type DeleteHistoryEntryPayload = AuthenticatedPayload<DeleteHistoryEntryParams>;

// ==========================================
// HISTORY IPC PAYLOAD TYPES
// ==========================================
export interface GetFullHistoryParams {
  patientId: string;
}
export type GetFullHistoryPayload = AuthenticatedPayload<GetFullHistoryParams>;

// ==========================================
// USER IPC PAYLOAD TYPES
// ==========================================
export interface CreateUserParams {
  email: string;
  password: string;
  userName: string;
  role: string;
}
export type CreateUserPayload = AuthenticatedPayload<CreateUserParams>;

export interface GetUserByIdParams {
  userId: string;
}
export type GetUserByIdPayload = AuthenticatedPayload<GetUserByIdParams>;

export interface UpdateUserProfileParams {
  userId?: string;
  userName?: string;
  email?: string;
  phone?: string;
}
export type UpdateUserProfilePayload = AuthenticatedPayload<UpdateUserProfileParams>;

export interface UpdateUserStatusParams {
  userId: string;
  active: boolean;
}
export type UpdateUserStatusPayload = AuthenticatedPayload<UpdateUserStatusParams>;

export interface UpdateUserPasswordParams {
  userId: string;
  newPassword: string;
  currentPassword?: string;
}
export type UpdateUserPasswordPayload = AuthenticatedPayload<UpdateUserPasswordParams>;

export interface DeleteUserParams {
  userId: string;
}
export type DeleteUserPayload = AuthenticatedPayload<DeleteUserParams>;

// ==========================================
// PDF EXPORT IPC PAYLOAD TYPES
// ==========================================
export type GeneratePdfPayload = AuthenticatedPayload<PdfDomainPayload>;

export interface GetPdfByPatientParams {
  patientId: string;
}
export type GetPdfByPatientPayload = AuthenticatedPayload<GetPdfByPatientParams>;

// ==========================================
// LOGGER IPC PAYLOAD TYPES
// ==========================================
export interface LoggerGetAllParams {
  query?: Record<string, unknown>;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}
export type LoggerGetAllPayload = AuthenticatedPayload<LoggerGetAllParams>;

export interface LoggerGetByIdParams {
  id: number | string;
  [key: string]: unknown;
}
export type LoggerGetByIdPayload = AuthenticatedPayload<LoggerGetByIdParams>;

export interface LoggerUpdateParams {
  id: number | string;
  data: Record<string, unknown>;
  [key: string]: unknown;
}
export type LoggerUpdatePayload = AuthenticatedPayload<LoggerUpdateParams>;

export interface LoggerDeleteParams {
  id: number | string;
  [key: string]: unknown;
}
export type LoggerDeletePayload = AuthenticatedPayload<LoggerDeleteParams>;

// ==========================================
// AUTH IPC PAYLOAD TYPES
// ==========================================
export interface AuthLoginParams {
  email: string;
  password: string;
}

export interface AuthCreateInitialOwnerParams {
  email: string;
  username: string;
}
