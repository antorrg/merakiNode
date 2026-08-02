// AUTO-GENERATED FILE — DO NOT EDIT

export interface Users {
  user_id?: string | null
  user_email: string
  password: string
  nickname?: string | null
  user_name?: string | null
  role: string
  enabled?: boolean | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Patients {
  patient_id?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  type_doc?: string | null
  identity_code?: string | null
  birth_date: string
  age?: number | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface PatientRelations {
  relation_id?: string | null
  guardian_id: string
  dependent_id: string
  relationship_type?: string | null
  is_primary_contact?: boolean | null
  created_at: string
  updated_at: string
}

export interface HistoryEntry {
  entry_id?: string | null
  patient_id: string
  professional_id: string
  visit_type?: string | null
  visit_date?: string | null
  reason?: string | null
  diagnosis_summary?: string | null
  observations?: string | null
  evolution?: string | null
  treatment_plan?: string | null
  recommendations?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Diagnosis {
  diagnosis_id?: string | null
  patient_id: string
  title?: string | null
  description?: string | null
  start_date: string
  end_date?: string | null
  status?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Treatment {
  treatment_id?: string | null
  entry_id: string
  name?: string | null
  description?: string | null
  frequency?: string | null
  objective?: string | null
  start_date: string
  end_date?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Sessions {
  session_id?: string | null
  user_id: string
  username?: string | null
  role: string
  created_at?: number | null
  expires_at?: number | null
  rolling?: boolean | null
}

export interface Logs {
  id?: number | null
  level_name: string
  level_code?: number | null
  message: string
  type?: string | null
  status?: number | null
  stack?: string | null
  contexts?: string | null
  pid: number
  time?: number | null
  hostname?: string | null
  keep?: boolean | null
  created_at: string
  updated_at: string
}

export interface EntryDiagnoses {
  entry_id: string
  diagnosis_id: string
  created_at: string
}

export interface Appointments {
  appointment_id?: string | null
  patient_id: string
  professional_id: string
  service: string
  status: string
  start_time: string
  end_time: string
  notes?: string | null
  created_by: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface PdfExports {
  id?: string | null
  patient_id: string
  user_id: string
  file_name: string
  relative_path: string
  visit_ids: string
  document_type?: string | null
  created_at: string
}

