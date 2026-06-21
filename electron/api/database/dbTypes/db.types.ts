// AUTO-GENERATED FILE — DO NOT EDIT

export interface Users {
  user_id?: string
  user_email: string
  password: string
  nickname?: string
  user_name?: string
  role: string
  enabled?: boolean
  created_at: Date
  updated_at: Date
}

export interface Patients {
  patient_id?: string
  email?: string
  first_name?: string
  last_name?: string
  type_doc?: string
  identity_code?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface HistoryEntry {
  history_id?: string
  patient_id: string
  visit_date?: string
  reason?: string
  diagnosis?: string
  observations?: string
  evolution?: string
  tratment_plan?: string
  recomendations?: string
  professional_name?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface Diagnosis {
  diagnosis_id?: string
  patient_id: string
  title?: string
  description?: string
  start_date: Date
  end_date?: Date
  status?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface Treatment {
  treatment_id?: string
  history_id: string
  name?: string
  description?: string
  frequency?: string
  objective?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
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

