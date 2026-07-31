import type { Schema } from "req-valid-express";

export const registerPatientSchema: Schema = {
  email: { type: "string", default: null },
  firstName: { type: "string", sanitize: { trim: true } },
  lastName: { type: "string", sanitize: { trim: true } },
  typeDoc: { type: "string" },
  identityCode: { type: "string" },
  birthDate: { type: "string" },
  phone: { type: "string", default: null },
  address: { type: "string" },
  city: { type: "string" },
  postalCode: { type: "string" },
  guardians: { type: "array", default: [] }
};

export const updateContactSchema: Schema = {
  patientId: { type: "string" },
  firstName: { type: "string", default: null, sanitize: { trim: true } },
  lastName: { type: "string", default: null, sanitize: { trim: true } },
  typeDoc: { type: "string", default: null },
  identityCode: { type: "string", default: null },
  birthDate: { type: "string", default: null },
  phone: { type: "string", default: null },
  email: { type: "string", default: null },
  address: { type: "string", default: null },
  city: { type: "string", default: null },
  postalCode: { type: "string", default: null },
  guardians: { type: "array", default: null }
};

export const getByIdSchema: Schema = {
  patientId: { type: "string" }
};

export const deleteSchema: Schema = {
  patientId: { type: "string" }
};
