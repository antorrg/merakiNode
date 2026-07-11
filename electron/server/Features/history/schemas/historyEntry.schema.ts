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
  recommendations: { type: "string", default: null }
};

export const updateEntrySchema: Schema = {
  entryId: { type: "string" },
  visitType: { type: "string", default: undefined },
  visitDate: { type: "string", default: undefined },
  reason: { type: "string", default: undefined, sanitize: { trim: true } },
  diagnosisSummary: { type: "string", default: undefined },
  observations: { type: "string", default: undefined },
  evolution: { type: "string", default: undefined },
  treatmentPlan: { type: "string", default: undefined },
  recommendations: { type: "string", default: undefined }
};

export const deleteEntrySchema: Schema = {
  entryId: { type: "string" }
};
