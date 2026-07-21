import type { Schema } from "req-valid-express";

export const addEntrySchema: Schema = {
  patientId: { type: "string" },
  professionalId: { type: "string" },
  visitType: { type: "string" },
  visitDate: { type: "string" },
  reason: { type: "string", sanitize: { trim: true } },
  diagnosisSummary: { type: "string", default: null },
  observations: { type: "string", default: null },
  evolution: { type: "string", default: null },
  treatmentPlan: { type: "string", default: null },
  recommendations: { type: "string", default: null },
  diagnosisIds: { type: "array", default: [] }
};

export const updateEntrySchema: Schema = {
  entryId: { type: "string" },
  visitType: { type: "string" },
  visitDate: { type: "string" },
  reason: { type: "string", sanitize: { trim: true } },
  diagnosisSummary: { type: "string", default: null },
  observations: { type: "string", default: null },
  evolution: { type: "string", default: null },
  treatmentPlan: { type: "string", default: null },
  recommendations: { type: "string", default: null },
  diagnosisIds: { type: "array", default: [] }
};

export const deleteEntrySchema: Schema = {
  entryId: { type: "string" }
};

export const getPatientEntriesSchema: Schema = {
  patientId: { type: "string" },
  professionalId: { type: "string", default:'' }
};
