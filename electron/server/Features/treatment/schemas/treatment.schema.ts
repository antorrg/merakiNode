import type { Schema } from "req-valid-express";

export const addTreatmentSchema: Schema = {
  entryId: { type: "string" },
  name: { type: "string", sanitize: { trim: true } },
  description: { type: "string", default: null, sanitize: { trim: true } },
  frequency: { type: "string", default: null, sanitize: { trim: true } },
  objective: { type: "string", default: null, sanitize: { trim: true } },
  startDate: { type: "string" },
  endDate: { type: "string", default: null }
};

export const updateTreatmentSchema: Schema = {
  treatmentId: { type: "string" },
  name: { type: "string", default: undefined, sanitize: { trim: true } },
  description: { type: "string", default: undefined, sanitize: { trim: true } },
  frequency: { type: "string", default: undefined, sanitize: { trim: true } },
  objective: { type: "string", default: undefined, sanitize: { trim: true } },
  startDate: { type: "string", default: undefined },
  endDate: { type: "string", default: undefined }
};

export const deleteTreatmentSchema: Schema = {
  treatmentId: { type: "string" }
};
