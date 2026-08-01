import type { Schema } from "req-valid-express";

export const createAppointmentSchema: Schema = {
  patientId: {
    type: "string",
    sanitize: { trim: true }
  },
  professionalId: {
    type: "string",
    sanitize: { trim: true }
  },
  service: {
    type: "string",
    sanitize: { trim: true }
  },
  startTime: {
    type: "string",
    sanitize: { trim: true }
  },
  endTime: {
    type: "string",
    sanitize: { trim: true }
  },
  notes: {
    type: "string",
    default: "",
    sanitize: { trim: true }
  }
};

export const getByRangeSchema: Schema = {
  startDate: {
    type: "string",
    sanitize: { trim: true }
  },
  endDate: {
    type: "string",
    sanitize: { trim: true }
  },
  professionalId: {
    type: "string",
    default: "",
    sanitize: { trim: true }
  }
};

export const getByPatientSchema: Schema = {
  patientId: {
    type: "string",
    sanitize: { trim: true }
  }
};

export const updateStatusSchema: Schema = {
  appointmentId: {
    type: "string",
    sanitize: { trim: true }
  },
  status: {
    type: "string",
    sanitize: { trim: true }
  },
  notes: {
    type: "string",
    default: "",
    sanitize: { trim: true }
  }
};

export const deleteAppointmentSchema: Schema = {
  appointmentId: {
    type: "string",
    sanitize: { trim: true }
  }
};
