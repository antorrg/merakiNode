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
  guardians: { type: "array", default: [] }
};

export const updateContactSchema: Schema = {
  patientId: { type: "string", sanitize: { trim: true } },
  firstName: { type: "string", sanitize: { trim: true } },
  lastName: { type: "string", sanitize: { trim: true } },
  typeDoc: { type: "string", sanitize: { trim: true } },
  identityCode: { type: "string", sanitize: { trim: true } },
  birthDate: { type: "string", sanitize: { trim: true } },
  phone: { type: "string", default: null, sanitize: { trim: true } },
  email: { type: "string", default: null, sanitize: { trim: true } },
  address: { type: "string", sanitize: { trim: true } },
  city: { type: "string", sanitize: { trim: true } },
  postalCode: { type: "string", sanitize: { trim: true } },
  guardians: [
    {
      relationId: { type: "string", default: null, sanitize: { trim: true } },
      guardianId: { type: "string", sanitize: { trim: true } },
      relationshipType: { type: "string", default: null, sanitize: { trim: true } },
      relationship: { type: "string", default: null, sanitize: { trim: true } },
      isPrimaryContact: { type: "boolean", default: false }
    }
  ]
};

export const getByIdSchema: Schema = {
  patientId: { type: "string" }
};

export const deleteSchema: Schema = {
  patientId: { type: "string" }
};