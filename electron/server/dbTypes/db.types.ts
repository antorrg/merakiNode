// AUTO-GENERATED FILE — DO NOT EDIT

export interface Users {
  user_id?: string
  user_email: string
  password: string
  nickname?: string
  user_name?: string
  role: string
  enabled?: boolean
  created_at: string
  updated_at: string
}

export interface Patients {
  patient_id?: string
  email?: string
  first_name?: string
  last_name?: string
  type_doc?: string
  identity_code?: string
  birth_date: string
  age?: number
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface PatientRelations {
  relation_id?: string
  guardian_id: string
  dependent_id: string
  relationship_type?: string
  is_primary_contact?: boolean
  created_at: string
  updated_at: string
}

export interface HistoryEntry {
  history_id?: string
  patient_id: string
  userId: string
  visit_date?: string
  reason?: string
  diagnosis?: string
  observations?: string
  evolution?: string
  tratment_plan?: string
  recomendations?: string
  professional_name?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Diagnosis {
  diagnosis_id?: string
  patient_id: string
  title?: string
  description?: string
  start_date: string
  end_date?: string
  status?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Treatment {
  treatment_id?: string
  history_id: string
  name?: string
  description?: string
  frequency?: string
  objective?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Sessions {
  session_id?: string
  user_id: string
  username?: string
  role: string
  created_at?: number
  expires_at?: number
  rolling?: boolean
}

export interface Logs {
  id?: number
  level_name: string
  level_code?: number
  message: string
  type?: string
  status?: number
  stack?: string
  contexts?: string
  pid: number
  time?: number
  hostname?: string
  keep?: boolean
  created_at: string
  updated_at: string
}

