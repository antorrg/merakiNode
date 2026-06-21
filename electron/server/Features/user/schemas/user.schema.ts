import type { Schema } from "req-valid-express";


export const updateProfileSchema: Schema = {
  userId:{
    type:"string",
  },
  email: {
    type: "string",
    sanitize: {
      trim: true
    }
  },
  name: {
    type: "string",
    sanitize: {
      trim: true
    }
  },
  nickname: {
    type: "string",
    default: "user",
    sanitize: {
      trim: true
    }
  }
};
export const createUserSchema: Schema = {
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
  },
};
export const changeStatusSchema: Schema = {
  userId:{
    type:"string",
  },
  enabled: {
    type: "boolean",
    default: true
  },
};
export const changeRoleSchema : Schema = {
  userId:{
    type:"string",
  },
  role: {
    type:"string",
  },
};
export const changePasswordSchema  : Schema = {
  userId:{
    type:"string",
  },
  password: {
    type:"string",
  },
    newPassword: {
    type:"string",
  },
};
export const getUserByIdSchema  : Schema = {
  userId:{
    type:"string",
  },
};

