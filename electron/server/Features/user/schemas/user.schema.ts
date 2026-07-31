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
  userEmail: {
    type: "string",
    sanitize: {
      trim: true
    }
  },
    userName: {
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
    role: {
    type: "string",
    default: 'SECRETARIO',
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

