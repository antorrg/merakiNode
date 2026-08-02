import type { Schema  } from "req-valid-express";

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
  isPatient: { type: "boolean", default: true },
  guardians: { type: "array", default: [] }
};

export const updateContactSchema: Schema = {
  patientId: { type: "string", sanitize: { trim: true } },
  firstName: { type: "string", default: undefined, sanitize: { trim: true } },
  lastName: { type: "string", default: undefined, sanitize: { trim: true } },
  typeDoc: { type: "string", default: undefined, sanitize: { trim: true } },
  identityCode: { type: "string", default: undefined, sanitize: { trim: true } },
  birthDate: { type: "string", default: undefined, sanitize: { trim: true } },
  phone: { type: "string", default: null, sanitize: { trim: true } },
  email: { type: "string", default: null, sanitize: { trim: true } },
  address: { type: "string", default: undefined, sanitize: { trim: true } },
  city: { type: "string", default: undefined, sanitize: { trim: true } },
  postalCode: { type: "string", default: undefined, sanitize: { trim: true } },
  isPatient: { type: "boolean", default: undefined },
  guardians: { type: "array", default: undefined }
};

export const getByIdSchema: Schema = {
  patientId: { type: "string" }
};

export const getByIdentityCodeSchema: Schema = {
  identityCode: { type: "string" }
};

export const deleteSchema: Schema = {
  patientId: { type: "string" }
};