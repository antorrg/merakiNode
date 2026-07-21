import type { Schema } from "req-valid-express";

export const addDiagnosisSchema: Schema = {
  patientId: { type: "string" },
  title: { type: "string", sanitize: { trim: true } },
  description: { type: "string", default: null, sanitize: { trim: true } },
  startDate: { type: "string" },
  status: { type: "string" }
};

export const updateDiagnosisSchema: Schema = {
  diagnosisId: { type: "string" },
  title: { type: "string", default: undefined, sanitize: { trim: true } },
  description: { type: "string", default: undefined, sanitize: { trim: true } },
  status: { type: "string", default: undefined },
  endDate: { type: "string", default: undefined }
};

export const deleteDiagnosisSchema: Schema = {
  diagnosisId: { type: "string" }
};

export const getByPatientSchema: Schema = {
  patientId: { type: "string" }
};
