import type { Schema } from "req-valid-express";

const authlogin: Schema = {
  email: {
    type: "string",
    sanitize: {
      trim: true
    }
  },
  password: {
    type: "string",
    sanitize: {
      trim: true
    }
  }
};

export default authlogin;
