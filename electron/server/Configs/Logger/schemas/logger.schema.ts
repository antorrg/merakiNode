import type { Schema } from 'req-valid-express';

export const getLogsSchema: Schema = {
  searchField: { type: "string", optional: true },
  search: { type: "string", optional: true },
  page: { type: "int", optional: true },
  limit: { type: "int", optional: true },
  sortBy: { type: "string", optional: true },
  order: { type: "string", optional: true }
};

export const getLogByIdSchema: Schema = {
  id: { type: "int" }
};

export const updateLogSchema: Schema = {
  id: { type: "int" },
  keep: { type: "boolean" }
};

export const deleteLogSchema: Schema = {
  id: { type: "int" }
};
