var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _UserService_instances, parser_fn, _allowedRoles, _AuthApplications_static, uuidValidator_fn, _Session_static, convertRole_fn, _sessionStore, _AuxValid_static, getDefaultValue_fn, validateBoolean_fn, validateInt_fn, validateFloat_fn, escapeHTML_fn, trimString_fn, _ValidateSchema_static, validateField_fn;
import { app, ipcMain, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";
import crypto from "crypto";
import argon2 from "argon2";
const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";
const databaseName = isTest ? "database.test.sqlite" : isDev ? "database.dev.sqlite" : "database.sqlite";
const databaseDir = isDev || isTest ? path.resolve(process.cwd(), "data") : app.getPath("userData");
const envConfig = {
  DatabasePath: path.join(databaseDir, databaseName)
};
const dirname = path.join(process.cwd(), "electron/api/database/dbTypes");
function toPascal(name) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}
function mapType(declaredType) {
  const dt = declaredType.toUpperCase();
  if (dt.includes("INT")) return "number";
  if (dt.includes("CHAR") || dt.includes("TEXT") || dt.includes("CLOB") || dt.includes("UUID")) return "string";
  if (dt.includes("REAL") || dt.includes("FLOA") || dt.includes("DOUB") || dt.includes("NUME") || dt.includes("DECI")) return "number";
  if (dt.includes("BOOL")) return "boolean";
  if (dt.includes("DATE") || dt.includes("TIME")) return "Date";
  if (dt.includes("BLOB")) return "Buffer";
  return "any";
}
function generateTypes(db2) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const tables = db2.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
  `).all();
  console.log("va a ser engorroso de leer: ", tables);
  let output = `// AUTO-GENERATED FILE — DO NOT EDIT

`;
  for (const row of tables) {
    const table = row.name;
    const cols = db2.pragma(`table_info('${table}')`);
    output += `export interface ${toPascal(table)} {
`;
    for (const col of cols) {
      const tsType = mapType(col.type || "");
      const optional = col.notnull === 0 ? "?" : "";
      output += `  ${col.name}${optional}: ${tsType}
`;
    }
    output += `}

`;
  }
  try {
    if (fs.existsSync(`${dirname}/db.types.ts`)) {
      fs.unlinkSync(`${dirname}/db.types.ts`);
    }
    fs.mkdirSync(dirname, { recursive: true });
    fs.writeFileSync(`${dirname}/db.types.ts`, output);
    console.log("✅ Types generated");
  } catch (error) {
    console.error("Error generating db types: ", error);
    throw error;
  }
}
class SqliteDb {
  constructor(path2, tables) {
    __publicField(this, "path");
    __publicField(this, "tables");
    __publicField(this, "db");
    this.path = path2;
    this.tables = tables;
    this.db = new Database(this.path);
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("journal_mode = WAL");
  }
  authenticate() {
    try {
      const stmt = this.db.prepare("SELECT 1 as status");
      const result = stmt.get();
      if (result) {
        return true;
      } else {
        throw new Error("Database file could not be read properly");
      }
    } catch (error) {
      throw error;
    }
  }
  sync(options = {}) {
    const orderedTables = this.sortTablesByDeps(this.tables);
    const { force = false } = options;
    if (force) {
      console.log("🧨 Dropping tables...");
      for (const table of [...orderedTables].reverse()) {
        this.db.exec(`DROP TABLE IF EXISTS ${table.name};`);
      }
    }
    console.log("📐 Creating tables...");
    for (const table of orderedTables) {
      this.db.exec(table.sql);
    }
    console.log("✅ Sync complete");
    generateTypes(this.db);
  }
  sortTablesByDeps(tables) {
    const sorted = [];
    const visited = /* @__PURE__ */ new Set();
    const visit = (table) => {
      if (visited.has(table.name)) return;
      visited.add(table.name);
      table.deps.forEach((depName) => {
        const dep = tables.find((t) => t.name === depName);
        if (!dep) throw new Error(`Missing dependency ${depName}`);
        visit(dep);
      });
      sorted.push(table);
    };
    tables.forEach(visit);
    return sorted;
  }
}
const users = {
  name: "users",
  sql: `CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nickname TEXT,
    user_name TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  deps: []
};
const patients = {
  name: "patients",
  sql: `CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    type_doc TEXT,
    identity_code TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  );`,
  deps: []
};
const history_entry = {
  name: "history_entry",
  sql: `CREATE TABLE IF NOT EXISTS history_entry (
    history_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    visit_date TEXT,
    reason TEXT,
    diagnosis TEXT,
    observations TEXT,
    evolution TEXT,
    tratment_plan TEXT,
    recomendations TEXT,
    professional_name TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE
  );`,
  deps: ["patients"]
};
const diagnosis = {
  name: "diagnosis",
  sql: `CREATE TABLE IF NOT EXISTS diagnosis (
  diagnosis_id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME,
  status TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE
  );`,
  deps: ["patients"]
};
const treatment = {
  name: "treatment",
  sql: `CREATE TABLE IF NOT EXISTS treatment (
  treatment_id TEXT PRIMARY KEY,
  history_id TEXT NOT NULL,
  name TEXT,
  description TEXT,
  frequency TEXT,
  objective TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  FOREIGN KEY(history_id) REFERENCES history_entry(history_id) ON UPDATE CASCADE
  );`,
  deps: ["history_entry"]
};
const sessions = {
  name: "sessions",
  sql: `CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT,
  role TEXT NOT NULL,
  created_at INTEGER, 
  expires_at INTEGER,
  rolling BOOLEAN DEFAULT 1,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );`,
  deps: ["users"]
};
const nameOfDb = () => {
  const url = envConfig.DatabasePath;
  if (!url) return "unknown";
  const parts = url.split("/");
  return parts[parts.length - 1] || "unknown";
};
const initialTables = [
  users,
  patients,
  history_entry,
  diagnosis,
  treatment,
  sessions
];
const dbPath = envConfig.DatabasePath;
const db = new SqliteDb(dbPath, initialTables);
async function startUp(syncing = false, reset = false) {
  try {
    if (syncing === true && reset === true) {
      console.log(`🔄 Restarting database "${nameOfDb()}" for testing...`);
      db.sync({ force: true });
      console.log("🧪  Database testing setup executed");
    } else if (syncing === true) {
      db.sync();
    }
    db.authenticate();
    console.log(`🟢​  Database SQLite initialized successfully at ${dbPath}!!`);
  } catch (error) {
    console.error("❌ Error starting database: ", error);
  }
}
const ErrorCode$1 = {
  // generic
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
  OPERATION_FAILED: "OPERATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  DATABASE_ERROR: "DATABASE_ERROR",
  // validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  REQUIRED_FIELD_MISSING: "REQUIRED_FIELD_MISSING",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_TYPE: "INVALID_TYPE",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  VALUE_NOT_ALLOWED: "VALUE_NOT_ALLOWED",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",
  // authorization
  ACCESS_DENIED: "ACCESS_DENIED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ROLE_NOT_ALLOWED: "ROLE_NOT_ALLOWED",
  FORBIDDEN: "FORBIDDEN",
  // resources
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  RESOURCE_LOCKED: "RESOURCE_LOCKED",
  // system
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  SERVICE_TIMEOUT: "SERVICE_TIMEOUT",
  DEPENDENCY_FAILURE: "DEPENDENCY_FAILURE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  // persistence
  DATA_READ_ERROR: "DATA_READ_ERROR",
  DATA_WRITE_ERROR: "DATA_WRITE_ERROR",
  DATA_INTEGRITY_ERROR: "DATA_INTEGRITY_ERROR",
  DATA_CONSTRAINT_VIOLATION: "DATA_CONSTRAINT_VIOLATION",
  DATA_CONFLICT: "DATA_CONFLICT",
  // security
  SECURITY_VIOLATION: "SECURITY_VIOLATION",
  CSRF_DETECTED: "CSRF_DETECTED",
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  REQUEST_BLOCKED: "REQUEST_BLOCKED",
  // operations
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",
  OPERATION_CONFLICT: "OPERATION_CONFLICT",
  INVALID_OPERATION_STATE: "INVALID_OPERATION_STATE",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  // files
  FILE_REQUIRED: "FILE_REQUIRED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  FILE_TYPE_NOT_ALLOWED: "FILE_TYPE_NOT_ALLOWED",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",
  FILE_DELETE_FAILED: "FILE_DELETE_FAILED",
  // session
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SESSION_INVALID: "SESSION_INVALID",
  CLIENT_STATE_INVALID: "CLIENT_STATE_INVALID",
  // environment
  CONFIG_MISSING: "CONFIG_MISSING",
  CONFIG_INVALID: "CONFIG_INVALID",
  ENVIRONMENT_ERROR: "ENVIRONMENT_ERROR"
};
class CustomError extends Error {
  constructor(log = false) {
    super();
    __publicField(this, "log");
    __publicField(this, "throwError", (message, code) => {
      const error = new Error(message);
      error.code = code ?? ErrorCode$1.INTERNAL_ERROR;
      error.contexts = [];
      throw error;
    });
    __publicField(this, "middlewareError", (message, code) => {
      const error = new Error(message);
      error.code = code ?? ErrorCode$1.INTERNAL_ERROR;
      error.contexts = [];
      return error;
    });
    __publicField(this, "processAndThrow", (err, context) => {
      const error = err instanceof Error ? err : new Error(String(err));
      if (!error.code) error.code = ErrorCode$1.INTERNAL_ERROR;
      if (!Array.isArray(error.contexts)) error.contexts = [];
      if (error.contexts.at(-1) !== context) {
        error.contexts.push(context);
      }
      throw error;
    });
    __publicField(this, "handleIpcError", (err, context) => {
      const normalized = this.processError(err, context);
      if (this.log) {
        console.error(
          {
            code: normalized.code,
            contexts: normalized.contexts,
            message: normalized.message
          },
          normalized.message
        );
      }
      return {
        ok: false,
        error: normalized
      };
    });
    __publicField(this, "wrapIpcHandler", (handler, context) => {
      return async (event, payload) => {
        try {
          const data = await handler(event, payload);
          return {
            ok: true,
            data
          };
        } catch (err) {
          return this.handleIpcError(err, context);
        }
      };
    });
    this.log = log;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  processError(err, context) {
    let normalized;
    if (err instanceof Error) {
      normalized = {
        code: err.code ?? ErrorCode$1.INTERNAL_ERROR,
        message: err.message,
        contexts: Array.isArray(err.contexts) ? err.contexts : []
      };
    } else {
      normalized = {
        code: ErrorCode$1.INTERNAL_ERROR,
        message: String(err),
        contexts: []
      };
    }
    const last = normalized.contexts.at(-1);
    if (last !== context) {
      normalized.contexts.push(context);
    }
    return normalized;
  }
}
const errorHandler = new CustomError(true);
const throwError = errorHandler.throwError;
errorHandler.middlewareError;
errorHandler.processError;
errorHandler.processAndThrow;
errorHandler.handleIpcError;
const wrapIpcHandler = errorHandler.wrapIpcHandler;
const authlogin = {
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
class CaseConverter {
  static toSnakeCase(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
  static toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
  static mapKeysToSnakeCase(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date || obj instanceof Buffer || obj instanceof RegExp) return obj;
    if (Array.isArray(obj)) return obj.map(CaseConverter.mapKeysToSnakeCase);
    const result = {};
    for (const key of Object.keys(obj)) {
      result[CaseConverter.toSnakeCase(key)] = CaseConverter.mapKeysToSnakeCase(obj[key]);
    }
    return result;
  }
  static mapKeysToCamelCase(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date || obj instanceof Buffer || obj instanceof RegExp) return obj;
    if (Array.isArray(obj)) return obj.map(CaseConverter.mapKeysToCamelCase);
    const result = {};
    for (const key of Object.keys(obj)) {
      result[CaseConverter.toCamelCase(key)] = CaseConverter.mapKeysToCamelCase(obj[key]);
    }
    return result;
  }
}
class BaseRepository {
  constructor(modelName, pkColumn = "id") {
    __publicField(this, "modelName");
    __publicField(this, "pkColumn");
    this.modelName = modelName;
    this.pkColumn = pkColumn;
  }
  /* CREATE */
  create(data) {
    const snakeCaseData = CaseConverter.mapKeysToSnakeCase(data);
    const columns = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const placeholders = columns.map(() => "?").join(", ");
    const stmt = db.db.prepare(`
      INSERT INTO ${this.modelName} (${columns.join(", ")})
      VALUES (${placeholders})
    `);
    const result = stmt.run(values);
    return {
      message: `Created in ${this.modelName} with ID ${result.lastInsertRowid}`,
      results: result.lastInsertRowid.toString()
    };
  }
  /* READ by id */
  getById(id) {
    const dbData = db.db.prepare(`
      SELECT *
      FROM ${this.modelName}
      WHERE ${this.pkColumn} = ?
    `).get(id);
    return {
      message: `Get by ID ${id} from ${this.modelName}`,
      results: dbData ? CaseConverter.mapKeysToCamelCase(dbData) : null
    };
  }
  /* UPDATE */
  update(id, data) {
    const snakeCaseData = CaseConverter.mapKeysToSnakeCase(data);
    const columns = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const setClause = columns.map((col) => `${col} = ?`).join(", ");
    const stmt = db.db.prepare(`
      UPDATE ${this.modelName}
      SET ${setClause}
      WHERE ${this.pkColumn} = ?
      RETURNING *
    `);
    const updatedData = stmt.get(...values, id);
    return {
      message: `Updated ID ${id} in ${this.modelName}`,
      results: updatedData ? CaseConverter.mapKeysToCamelCase(updatedData) : null
    };
  }
  /* DELETE */
  delete(id) {
    const result = db.db.prepare(`
      DELETE FROM ${this.modelName}
      WHERE ${this.pkColumn} = ?
    `).run(id);
    return {
      message: `Deleted ID ${id} from ${this.modelName}`,
      results: result.changes.toString()
    };
  }
  /* GET ALL */
  getAll() {
    const dataSql = `
      SELECT *
      FROM ${this.modelName}
    `;
    const results = db.db.prepare(dataSql).all();
    return {
      message: `Get all from ${this.modelName}`,
      results: results.map((row) => CaseConverter.mapKeysToCamelCase(row))
    };
  }
}
class UserRepository {
  constructor(db$1 = db) {
    __publicField(this, "base");
    __publicField(this, "db");
    this.base = new BaseRepository("users", "user_id");
    this.db = db$1;
  }
  async create(data) {
    const response = this.base.create(data);
    return { data: response.results };
  }
  async update(id, data) {
    const response = this.base.update(id, data);
    return { data: response.results };
  }
  async delete(id) {
    const response = this.base.delete(id);
    return { data: response.results };
  }
  async getById(id) {
    const response = this.base.getById(id);
    return { data: response.results };
  }
  async getAll() {
    const response = this.base.getAll();
    return response.results;
  }
  async findByEmail(email) {
    const sql = ` SELECT * FROM users WHERE email = ? LIMIT 1 `;
    const result = this.db.db.prepare(sql).get(email);
    return result ? CaseConverter.mapKeysToCamelCase(result) : null;
  }
}
class UuidHandler {
}
__publicField(UuidHandler, "idValidator", (value) => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  if (!UUID_REGEX) throw new Error("Domain Validation: UUID invalid format");
  return value;
});
__publicField(UuidHandler, "idCreator", () => {
  return crypto.randomUUID();
});
class UserApplications {
  static Id(prop) {
    if (!prop || typeof prop !== "string" || !UuidHandler.idValidator(prop)) {
      throw new Error("Invalid userId format");
    }
    return prop;
  }
  static Email(prop) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!prop || typeof prop !== "string" || !regexEmail.test(prop)) {
      throw new Error("Invalid email format");
    }
    return prop.toLowerCase();
  }
  static Role(prop) {
    if (!prop || typeof prop !== "string") throw new Error("Missing or invalid role");
    const role = prop.trim().toUpperCase();
    const allowed = ["ADMIN", "MECANICO", "EMPLOYEE", "USER"];
    if (!allowed.includes(role)) {
      throw new Error("Invalid role");
    }
    return role;
  }
}
class User {
  constructor({ userId, email, password, role, name, nickname, enabled }) {
    __publicField(this, "userId");
    __publicField(this, "email");
    __publicField(this, "password");
    __publicField(this, "role");
    __publicField(this, "name");
    __publicField(this, "nickname");
    __publicField(this, "enabled");
    this.userId = UserApplications.Id(userId);
    this.email = UserApplications.Email(email);
    this.password = User.validatePasswordHash(password);
    this.role = UserApplications.Role(role);
    this.name = User.validateName(name);
    this.nickname = User.validateNickname(nickname);
    this.enabled = User.validateEnabled(enabled);
  }
  static validatePasswordHash(prop) {
    if (typeof prop !== "string" || prop.length < 20) throw new Error("Invalid password hash");
    return prop;
  }
  static validateName(prop) {
    if (typeof prop !== "string") throw new Error("Invalid name");
    return prop;
  }
  static validateNickname(prop) {
    if (typeof prop !== "string") throw new Error("Invalid nickname");
    return prop;
  }
  static validateEnabled(prop) {
    if (typeof prop !== "boolean") throw new Error("Invalid enabled");
    return prop;
  }
  static register({ email, hashedPassword }) {
    if (!email || !hashedPassword) throw new Error("Missing parameters");
    return new User({
      userId: UuidHandler.idCreator(),
      email,
      password: hashedPassword,
      name: "No name",
      nickname: (email == null ? void 0 : email.split("@")[0]) ?? "user",
      role: "USER",
      enabled: true
    });
  }
  // Métodos de dominio (cambios de estado autorizados)
  disableUser() {
    this.enabled = false;
  }
  enabledUser() {
    this.enabled = true;
  }
  changePassword(hashedPassword) {
    this.password = User.validatePasswordHash(hashedPassword);
  }
  changeRole(role) {
    this.role = UserApplications.Role(role);
  }
  updateProfile(user2) {
    this.email = user2.email;
    this.name = user2.name;
    this.nickname = user2.nickname;
  }
  changeEmail(email) {
    this.email = UserApplications.Email(email);
  }
  // Mapeos para Infraestructura (DB) y Cliente (DTO)
  toPersistence() {
    return {
      user_id: this.userId,
      email: this.email,
      password: this.password,
      role: this.role,
      user_name: this.name,
      nickname: this.nickname,
      enabled: this.enabled ? 1 : 0
    };
  }
  toDTO() {
    return {
      userId: this.userId,
      email: this.email,
      role: this.role,
      name: this.name,
      nickname: this.nickname,
      enabled: this.enabled
    };
  }
}
class Hasher {
  static async hash(password) {
    return argon2.hash(password, {
      type: argon2.argon2id
    });
  }
  static async compare(password, hash) {
    return argon2.verify(hash, password);
  }
}
class UserService {
  constructor(userRepository2) {
    __privateAdd(this, _UserService_instances);
    this.userRepository = userRepository2;
  }
  async createUser(userData) {
    try {
      const record = await this.userRepository.findByEmail(userData.email);
      if (record) throwError("Email is already registered", ErrorCode$1.DATA_CONFLICT);
      const hashedPassword = await Hasher.hash(userData.password);
      const user2 = User.register({
        email: userData.email,
        hashedPassword
      });
      await this.userRepository.create(user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      if (error.code === "23505") throwError("Email is already registered", ErrorCode$1.DATA_CONFLICT);
      if (error.message && (error.message.includes("Invalid") || error.message.includes("Missing"))) {
        throwError(error.message, ErrorCode$1.VALIDATION_ERROR);
      }
      throw error;
    }
  }
  async getAll() {
    try {
      const records = await this.userRepository.getAll();
      return records.map((r) => {
        const parsed = __privateMethod(this, _UserService_instances, parser_fn).call(this, r);
        const { password, ...safeUser } = parsed;
        return safeUser;
      });
    } catch (error) {
      throw error;
    }
  }
  async getById(userId) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async changeStatus(userId, enabled) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      if (enabled === true) {
        user2.enabledUser();
      } else {
        user2.disableUser();
      }
      await this.userRepository.update(userId, user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async changeEmail(userId, email) {
    try {
      const exists = await this.userRepository.findByEmail(email);
      if (exists) throwError("Email is already registered", ErrorCode$1.DATA_CONFLICT);
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      user2.changeEmail(email);
      await this.userRepository.update(userId, user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async updateProfile(userId, updateData) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      user2.updateProfile(updateData);
      await this.userRepository.update(userId, user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async changeRole(userId, newRole) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      user2.changeRole(newRole);
      await this.userRepository.update(userId, user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const record = await this.userRepository.getById(userId);
      if (!record.data) throwError("User not found", ErrorCode$1.NOT_FOUND);
      const isMatch = await Hasher.compare(currentPassword, record.data.password);
      if (!isMatch) throwError("Invalid current password", ErrorCode$1.ACCESS_DENIED);
      const hashedNewPassword = await Hasher.hash(newPassword);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record.data));
      user2.changePassword(hashedNewPassword);
      await this.userRepository.update(userId, user2.toPersistence());
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
  async authenticate(email, plainPassword) {
    try {
      const record = await this.userRepository.findByEmail(email);
      if (!record) throwError("Invalid email or password", ErrorCode$1.ACCESS_DENIED);
      const isMatch = await Hasher.compare(plainPassword, record.password);
      if (!isMatch) throwError("Invalid email or password", ErrorCode$1.ACCESS_DENIED);
      const user2 = new User(__privateMethod(this, _UserService_instances, parser_fn).call(this, record));
      return user2.toDTO();
    } catch (error) {
      throw error;
    }
  }
}
_UserService_instances = new WeakSet();
parser_fn = function(data) {
  return {
    userId: data.userId || data.user_id,
    email: data.email,
    password: data.password,
    nickname: data.nickname,
    name: data.userName || data.user_name,
    role: data.role,
    enabled: data.enabled === 1 || data.enabled === true ? true : false
  };
};
const _AuthApplications = class _AuthApplications {
  static sessionIdVALID(sessionId) {
    var _a;
    return __privateMethod(_a = _AuthApplications, _AuthApplications_static, uuidValidator_fn).call(_a, sessionId);
  }
  static userIdVALID(userId) {
    var _a;
    return __privateMethod(_a = _AuthApplications, _AuthApplications_static, uuidValidator_fn).call(_a, userId);
  }
  static usernameVALID(username) {
    if (!username) {
      throw new Error("Missing username");
    }
    if (typeof username !== "string") {
      throw new Error("Invalid username type");
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2) {
      throw new Error("Username too short");
    }
    return cleanUsername;
  }
  static roleVALID(role) {
    if (!role) {
      throw new Error("Missing role");
    }
    if (!__privateGet(_AuthApplications, _allowedRoles).includes(role)) {
      throw new Error("Invalid role");
    }
    return role;
  }
  static createdAtVALID(createdAt) {
    if (!createdAt) {
      throw new Error("Missing createdAt");
    }
    if (typeof createdAt !== "number") {
      throw new Error("Invalid createdAt type");
    }
    if (!Number.isInteger(createdAt)) {
      throw new Error("Invalid createdAt format");
    }
    if (createdAt > Date.now()) {
      throw new Error("createdAt cannot be in the future");
    }
    return createdAt;
  }
  static expiresAtVALID(expiresAt) {
    if (!expiresAt) {
      throw new Error("Missing expiresAt");
    }
    if (typeof expiresAt !== "number") {
      throw new Error("Invalid expiresAt type");
    }
    if (!Number.isInteger(expiresAt)) {
      throw new Error("Invalid expiresAt format");
    }
    if (Date.now() >= expiresAt) {
      throw new Error("Session expired");
    }
    return expiresAt;
  }
};
_allowedRoles = new WeakMap();
_AuthApplications_static = new WeakSet();
uuidValidator_fn = function(id) {
  if (!id) {
    throw new Error("Missing UUID");
  }
  if (typeof id !== "string") {
    throw new Error("Invalid UUID type");
  }
  return UuidHandler.idValidator(id);
};
__privateAdd(_AuthApplications, _AuthApplications_static);
__privateAdd(_AuthApplications, _allowedRoles, ["ADMIN", "MODERATOR", "MECANICO", "USER"]);
let AuthApplications = _AuthApplications;
const _Session = class _Session {
  constructor({ sessionId, userId, username, role, createdAt, expiresAt, rolling = false }) {
    __publicField(this, "sessionId");
    __publicField(this, "userId");
    __publicField(this, "username");
    __publicField(this, "role");
    __publicField(this, "createdAt");
    __publicField(this, "expiresAt");
    __publicField(this, "rolling");
    this.sessionId = AuthApplications.sessionIdVALID(sessionId);
    this.userId = AuthApplications.userIdVALID(userId);
    this.username = AuthApplications.usernameVALID(username);
    this.role = AuthApplications.roleVALID(role);
    this.createdAt = AuthApplications.createdAtVALID(createdAt);
    this.expiresAt = AuthApplications.expiresAtVALID(expiresAt);
    this.rolling = rolling;
  }
  static createSession(sessionData, rolling = false, maxAge) {
    const maxTimeToExpire = maxAge ? maxAge : 18e5;
    const id = crypto.randomUUID();
    const created_at = Date.now();
    const timeToExpire = created_at + maxTimeToExpire;
    return new _Session({
      sessionId: id,
      userId: sessionData.userId,
      username: sessionData.username,
      role: sessionData.role,
      createdAt: created_at,
      expiresAt: timeToExpire,
      rolling
    });
  }
  // 1. Verify: Chequea si expiró. Si es rolling y aún es válida, extiende su tiempo.
  verify(maxAge = 18e5) {
    const now = Date.now();
    if (now >= this.expiresAt) {
      return false;
    }
    if (this.rolling) {
      this.expiresAt = now + maxAge;
    }
    return true;
  }
  // 2. Destroy: Invalida la sesión forzando su expiración al instante
  destroy() {
    this.expiresAt = 0;
  }
  // 3. Validación por roles: Verifica si el nivel del usuario es mayor o igual al requerido
  hasAccess(requiredRole) {
    var _a, _b;
    const userLevel = Number(__privateMethod(_a = _Session, _Session_static, convertRole_fn).call(_a, this.role));
    const requiredLevel = Number(__privateMethod(_b = _Session, _Session_static, convertRole_fn).call(_b, requiredRole));
    return userLevel >= requiredLevel;
  }
  // Getter para obtener el id fácilmente y buscar en la DB
  get id() {
    return this.sessionId;
  }
  // Exportar los datos limpios para guardarlos en la base de datos (SQLite)
  toJSON() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      username: this.username,
      role: this.role,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      rolling: this.rolling
    };
  }
  // Exportar solo los datos seguros/públicos que necesita el Frontend tras el login
  toClient() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      username: this.username,
      role: this.role
    };
  }
};
_Session_static = new WeakSet();
convertRole_fn = function(p) {
  var _a;
  if (typeof p === "number") {
    return ((_a = Object.keys(_Session.LevelRoles).find(
      (k) => _Session.LevelRoles[k] === p
    )) == null ? void 0 : _a.toString()) ?? "USER";
  }
  const key = p.trim();
  return Number(_Session.LevelRoles[key]) ?? Number(_Session.LevelRoles.USER);
};
__privateAdd(_Session, _Session_static);
__publicField(_Session, "LevelRoles", Object.freeze({
  ADMIN: 9,
  MODERATOR: 3,
  MECANICO: 2,
  USER: 1
}));
let Session = _Session;
class SessionRepository {
  constructor() {
    // Composición: SessionRepository "tiene un" BaseRepository en lugar de "ser un" BaseRepository
    __publicField(this, "base");
    __publicField(this, "tableName", "sessions");
    /**
     * Caché en memoria para las sesiones, provee un acceso mucho más rápido.
     * Usamos un Map en lugar de un Array para búsquedas, inserciones y borrados en O(1)
     */
    __privateAdd(this, _sessionStore, /* @__PURE__ */ new Map());
    this.base = new BaseRepository(this.tableName, "session_id");
  }
  /**
   * Guarda una nueva sesión localmente y en la base de datos delegando en BaseRepository
   */
  saveSession(session) {
    const data = session.toJSON();
    const sessionDataToSave = {
      ...data,
      rolling: data.rolling ? 1 : 0
    };
    __privateGet(this, _sessionStore).set(sessionDataToSave.sessionId, sessionDataToSave);
    const response = this.base.create(sessionDataToSave);
    return response !== null;
  }
  /**
   * Busca una sesión por su ID usando la memoria caché primero, 
   * si no existe se busca a través de BaseRepository y se guarda en caché.
   */
  findSession(sessionId) {
    let result = __privateGet(this, _sessionStore).get(sessionId);
    if (!result) {
      const response = this.base.getById(sessionId);
      result = response.results;
      if (result) {
        __privateGet(this, _sessionStore).set(result.sessionId, result);
      }
    }
    if (!result) return null;
    const sessionProp = {
      sessionId: result.sessionId,
      userId: result.userId,
      username: result.username,
      role: result.role,
      createdAt: result.createdAt,
      expiresAt: result.expiresAt,
      rolling: Boolean(result.rolling)
      // Volvemos de 1/0 a true/false
    };
    return new Session(sessionProp);
  }
  /**
   * Actualiza la sesión (usado cuando verify() renueva una sesión rolling) en memoria y DB.
   */
  updateSession(session) {
    const data = session.toJSON();
    const localSession = __privateGet(this, _sessionStore).get(data.sessionId);
    if (localSession) {
      localSession.expiresAt = data.expiresAt;
    }
    const updateData = {
      expiresAt: data.expiresAt
    };
    const response = this.base.update(data.sessionId, updateData);
    return response.results !== null;
  }
  /**
   * Elimina una sesión explícitamente de la memoria y usando BaseRepository
   */
  deleteSession(sessionId) {
    __privateGet(this, _sessionStore).delete(sessionId);
    const response = this.base.delete(sessionId);
    return parseInt(response.results) > 0;
  }
  /**
   * Métodos ultra-específicos del dominio que BaseRepository no maneja:
   * Limpia todas las sesiones que ya expiraron, en memoria local y en la DB.
   */
  cleanupExpired() {
    const now = Date.now();
    for (const [id, session] of __privateGet(this, _sessionStore).entries()) {
      if (session.expiresAt < now) {
        __privateGet(this, _sessionStore).delete(id);
      }
    }
    const stmt = db.db.prepare(`
      DELETE FROM ${this.tableName}
      WHERE expires_at < ?
    `);
    const result = stmt.run(now);
    return result.changes;
  }
}
_sessionStore = new WeakMap();
class AuthService {
  constructor(sessionRepository2, userService2) {
    this.sessionRepository = sessionRepository2;
    this.userService = userService2;
  }
  /**
   * Autentica al usuario usando credenciales y genera una sesión stateful.
   */
  async login(data, rolling = true) {
    const user2 = await this.userService.authenticate(data.email, data.password);
    if (!user2) throwError("Invalid email or password", ErrorCode$1.ACCESS_DENIED);
    const sessionData = {
      userId: user2.userId,
      username: user2.nickname || user2.name || user2.email.split("@")[0],
      role: user2.role
    };
    const session = Session.createSession(sessionData, rolling);
    const saved = this.sessionRepository.saveSession(session);
    if (!saved) throwError("Could not save session", ErrorCode$1.INTERNAL_ERROR);
    return {
      user: user2,
      session: session.toClient()
    };
  }
  /**
   * Verifica la sesión entrante, renueva expiración si es rolling y devuelve datos de la sesión.
   * Opcionalmente valida si el usuario cumple con el rol requerido.
   */
  async verifyService(sessionId, requiredRole) {
    const session = this.sessionRepository.findSession(sessionId);
    if (!session) throwError("Session not found", ErrorCode$1.SESSION_INVALID);
    const isValid = session.verify();
    if (!isValid) {
      this.sessionRepository.deleteSession(sessionId);
      throwError("Session expired", ErrorCode$1.SESSION_EXPIRED);
    }
    if (requiredRole && !session.hasAccess(requiredRole)) {
      throwError("Insufficient permissions", ErrorCode$1.ACCESS_DENIED);
    }
    this.sessionRepository.updateSession(session);
    return session.toClient();
  }
  /**
   * Cierra sesión destruyendo e invalidando el sessionId explícitamente.
   */
  async logout(sessionId) {
    const session = this.sessionRepository.findSession(sessionId);
    if (session) {
      session.destroy();
      this.sessionRepository.deleteSession(sessionId);
    }
    return true;
  }
}
const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const userService = new UserService(userRepository);
const authService = new AuthService(sessionRepository, userService);
const _AuxValid = class _AuxValid {
  static splitObjectProps(obj, propsToExtract = []) {
    const { rest, extracted } = Object.entries(obj).reduce((acc, [key, value]) => {
      const k = key;
      if (propsToExtract.includes(k))
        acc.extracted[k] = value;
      else
        acc.rest[key] = value;
      return acc;
    }, { rest: {}, extracted: {} });
    return { rest, ...extracted };
  }
  static validateValue(value, fieldType, fieldName, itemIndex, sanitize) {
    var _a, _b, _c, _d, _e;
    const indexInfo = itemIndex !== null ? ` in item[${itemIndex}]` : "";
    if (typeof value === "object") {
      if (value instanceof String || value instanceof Number || value instanceof Boolean) {
        value = value.valueOf();
      }
    }
    switch (fieldType) {
      case "boolean":
        return __privateMethod(_a = _AuxValid, _AuxValid_static, validateBoolean_fn).call(_a, value);
      case "int":
        return __privateMethod(_b = _AuxValid, _AuxValid_static, validateInt_fn).call(_b, value);
      case "float":
        return __privateMethod(_c = _AuxValid, _AuxValid_static, validateFloat_fn).call(_c, value);
      case "array":
        if (!Array.isArray(value)) {
          throw new Error(`Invalid array value for field ${fieldName}${indexInfo}`);
        }
        return value;
      case "string":
      default:
        if (typeof value !== "string") {
          throw new Error(`Invalid string value for field ${fieldName}${indexInfo}`);
        }
        if (sanitize) {
          if (sanitize.trim)
            value = __privateMethod(_d = _AuxValid, _AuxValid_static, trimString_fn).call(_d, value);
          if (sanitize.escape)
            value = __privateMethod(_e = _AuxValid, _AuxValid_static, escapeHTML_fn).call(_e, value);
          if (sanitize.lowercase)
            value = value.toLowerCase();
          if (sanitize.uppercase)
            value = value.toUpperCase();
        }
        return value;
    }
  }
};
_AuxValid_static = new WeakSet();
getDefaultValue_fn = function(type) {
  switch (type) {
    case "boolean":
      return false;
    case "int":
      return 1;
    case "float":
      return 1;
    case "string":
      return "";
    default:
      return null;
  }
};
validateBoolean_fn = function(value) {
  if (typeof value === "boolean")
    return value;
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  throw new Error("Invalid boolean value");
};
validateInt_fn = function(value) {
  const intValue = Number(value);
  if (isNaN(intValue) || !Number.isInteger(intValue))
    throw new Error("Invalid integer value");
  return intValue;
};
validateFloat_fn = function(value) {
  const floatValue = parseFloat(value);
  if (isNaN(floatValue))
    throw new Error("Invalid float value");
  return floatValue;
};
escapeHTML_fn = function(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, "&#x2F;").replace(/\\/g, "&#x5C;").replace(/`/g, "&#96;");
};
trimString_fn = function(str) {
  return String(str).trim();
};
__privateAdd(_AuxValid, _AuxValid_static);
__publicField(_AuxValid, "ValidReg", {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Z]).{8,}$/,
  UUIDv4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  INT: /^\d+$/,
  // Solo enteros positivos
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  // ObjectId de MongoDB
  FIREBASE_ID: /^[A-Za-z0-9_-]{20}$/
  // Firebase push ID
});
let AuxValid = _AuxValid;
function isFieldSchema(s) {
  return typeof s === "object" && s !== null && "type" in s;
}
function isSchema(s) {
  return typeof s === "object" && s !== null && !("type" in s);
}
const _ValidateSchema = class _ValidateSchema {
  // static validatorBody(schema: Schema, maxDepth:number=10) {
  //   return (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const validated = ValidateSchema.#validateStructure(req.body, schema,undefined, maxDepth);
  //       req.body = validated;
  //       next();
  //     } catch (err: any) {
  //       return next(AuxValid.middError(err.message, 400));
  //     }
  //   };
  // }
  // static validateQuery(schema: Schema, rules: QueryRule = {}, maxDepth:number = 5) {
  //   return (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const validated = ValidateSchema.#validateStructure(req.query, schema, undefined, maxDepth);
  //           /*
  //           Bloque antiguo comentado — se conserva para comparación.
  //           for (const field of Object.keys(rules)) {
  //             const allowed = rules[field];
  //             const value = validated[field];
  //             if (value === undefined) continue;
  //             // Si el valor existe y NO está en la lista permitida → error
  //             if (value !== undefined && !allowed.map(String).includes(String(value))) {
  //               return next(
  //                 AuxValid.middError(
  //                   `Invalid value for '${field}'. Allowed: ${allowed.join(", ")}`,
  //                   400
  //                 )
  //               );
  //             }
  //           }
  //           */
  //           // Usar la implementación centralizada y robusta.
  //           ValidateSchema.#allowedValuesByRules(validated, rules);
  //       req.context = req.context || {};
  //       req.context.query = validated;
  //       next();
  //     } catch (err: any) {
  //       return next(AuxValid.middError(err.message, 400));
  //     }
  //   };
  // }
  // static validateHeaders(schema: Schema, maxDepth:number=3) {
  //   return (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const headers = req.headers || {};
  //       const contentType = headers["content-type"];
  //       if (!contentType) throw new Error("Missing required header: content-type");
  //       const lowerContentType = contentType.toLowerCase();
  //       if (
  //         lowerContentType !== "application/json" &&
  //         !lowerContentType.startsWith("multipart/form-data")
  //       ) {
  //         throw new Error("Invalid Content-Type header");
  //       }
  //       const validated = schema
  //         ? ValidateSchema.#validateStructure(headers, schema, "headers", maxDepth)
  //         : { "content-type": contentType };
  //       req.context = req.context || {};
  //       req.context.headers = validated;
  //       next();
  //     } catch (err: any) {
  //       return next(AuxValid.middError(err.message, 400));
  //     }
  //   };
  // }
  static validateStructure(data, schema, path2, maxDepth = 20, depth = 0) {
    var _a, _b;
    if (depth > maxDepth) {
      throw new Error(`Schema validation exceeded maximum depth at ${path2 || "root"}`);
    }
    if (Array.isArray(schema)) {
      if (!Array.isArray(data)) {
        throw new Error(`Expected array at ${path2 || "root"}`);
      }
      return data.map((item, i) => _ValidateSchema.validateStructure(item, schema[0], `${path2}[${i}]`, maxDepth, depth + 1));
    }
    if (isFieldSchema(schema)) {
      return __privateMethod(_a = _ValidateSchema, _ValidateSchema_static, validateField_fn).call(_a, data, schema, path2);
    }
    if (isSchema(schema)) {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new Error(`Expected object at ${path2 || "root"}`);
      }
      const result = {};
      for (const key in schema) {
        const fieldSchema = schema[key];
        const fullPath = path2 ? `${path2}.${key}` : key;
        const value = data[key];
        if (!(key in data)) {
          if (typeof fieldSchema === "object" && "default" in fieldSchema) {
            result[key] = fieldSchema.default;
            continue;
          } else {
            throw new Error(`Missing field: ${key} at ${fullPath}`);
          }
        }
        result[key] = _ValidateSchema.validateStructure(value, fieldSchema, fullPath, maxDepth, depth + 1);
      }
      return result;
    }
    if (typeof schema === "string") {
      if (!["string", "int", "float", "boolean", "array"].includes(schema)) {
        throw new Error(`Invalid type '${schema}' at ${path2 || "root"}`);
      }
      return __privateMethod(_b = _ValidateSchema, _ValidateSchema_static, validateField_fn).call(_b, data, { type: schema }, path2);
    }
    throw new Error(`Invalid schema at ${path2 || "root"}`);
  }
  /* static allowedValuesByRules = (validated: any, rules: QueryRule) => {
      const containsAllowed = (value: any, allowed: (string | number | boolean)[]) => {
        const t = typeof value;
        if (t === "number") {
          return allowed.some((a) => (typeof a === "number" ? a === value : Number(a) === value && !Number.isNaN(Number(a))));
        }
        if (t === "boolean") {
          return allowed.some((a) => (typeof a === "boolean" ? a === value : String(a).toLowerCase() === String(value).toLowerCase()));
        }
        if (t === "string") {
          return allowed.map(String).includes(String(value));
        }
        // For other types (object/function/etc.) we don't support comparison here
        return false;
      };
  
      for (const field of Object.keys(rules)) {
        const allowed = rules[field];
        const value = validated[field];
  
        // Do not allow missing/null values when using rules.
        // Documentación: si vas a usar `rules` asegúrate de proporcionar un `default` en el schema
        // o de validar la presencia antes de llamar a esta función.
        if (value === undefined || value === null) {
          throw new Error(`Invalid value for '${field}': value is required and cannot be null or undefined`);
        }
  
        // Arrays are not supported by these rules (debe manejarse explícitamente si fuera necesario)
        if (Array.isArray(value)) {
          throw new Error(`Invalid value for '${field}': arrays are not supported by rules`);
        }
  
        // If value has an unsupported type, throw clear error
        const vType = typeof value;
        if (!(vType === "string" || vType === "number" || vType === "boolean")) {
          throw new Error(`Invalid value for '${field}': unsupported type '${vType}' for rules`);
        }
  
        // Compare according to the runtime type of the validated value
        if (!containsAllowed(value, allowed)) {
          throw new Error(`Invalid value for '${field}'. Received: '${String(value)}'. Allowed: ${allowed.join(", ")}`);
        }
      }
  
      return validated;
    };
    */
  static allowedValuesByRules(validated, rules) {
    for (const field of Object.keys(rules)) {
      if (!(field in validated)) {
        throw new Error(`Rule defined for unknown field '${field}'`);
      }
      const allowed = rules[field];
      const value = validated[field];
      if (value === void 0 || value === null) {
        throw new Error(`Invalid value for '${field}': value is required and cannot be null or undefined`);
      }
      if (Array.isArray(value)) {
        throw new Error(`Invalid value for '${field}': arrays are not supported by rules`);
      }
      const valueType = typeof value;
      if (!["string", "number", "boolean"].includes(valueType)) {
        throw new Error(`Invalid value for '${field}': unsupported type '${valueType}' for rules`);
      }
      const isAllowed = allowed.some((candidate) => {
        return typeof candidate === valueType && candidate === value;
      });
      if (!isAllowed) {
        throw new Error(`Invalid value for '${field}'. Received: '${String(value)}'. Allowed: ${allowed.join(", ")}`);
      }
    }
    return validated;
  }
};
_ValidateSchema_static = new WeakSet();
validateField_fn = function(value, fieldSchema, path2) {
  const type = typeof fieldSchema === "string" ? fieldSchema : fieldSchema.type ?? "string";
  const sanitize = typeof fieldSchema === "object" ? fieldSchema.sanitize : void 0;
  if (value === void 0 || value === null) {
    if (typeof fieldSchema === "object" && "default" in fieldSchema) {
      return fieldSchema.default;
    }
    throw new Error(`Missing required field at ${path2}`);
  }
  return AuxValid.validateValue(value, type, path2, null, sanitize);
};
__privateAdd(_ValidateSchema, _ValidateSchema_static);
let ValidateSchema = _ValidateSchema;
const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  REQUIRED_FIELD_MISSING: "REQUIRED_FIELD_MISSING",
  FIELD_TOO_LONG: "FIELD_TOO_LONG",
  FIELD_TOO_SHORT: "FIELD_TOO_SHORT",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_TYPE: "INVALID_TYPE",
  OUT_OF_RANGE: "OUT_OF_RANGE",
  VALUE_NOT_ALLOWED: "VALUE_NOT_ALLOWED",
  ERR_INTERNAL: "ERR_INTERNAL"
};
class ErrorHandlers {
  static expressError(message, status) {
    const error = new Error(message);
    error.status = status || 500;
    return error;
  }
  static nodeError(message, code) {
    const error = new Error(message);
    error.code = ErrorCode[code ?? "ERR_INTERNAL"];
    return error;
  }
}
class Validator {
  static validateBody(schema, maxDepth = 10) {
    return (req, res, next) => {
      try {
        const validated = ValidateSchema.validateStructure(req.body, schema, void 0, maxDepth);
        req.body = validated;
        next();
      } catch (err) {
        return next(ErrorHandlers.expressError(err.message, 400));
      }
    };
  }
  static validateQuery(schema, rules = {}, maxDepth = 5) {
    return (req, res, next) => {
      try {
        const validated = ValidateSchema.validateStructure(req.query, schema, void 0, maxDepth);
        ValidateSchema.allowedValuesByRules(validated, rules);
        req.context = req.context || {};
        req.context.query = validated;
        next();
      } catch (err) {
        return next(ErrorHandlers.expressError(err.message, 400));
      }
    };
  }
  static validateHeaders(schema, maxDepth = 3) {
    return (req, res, next) => {
      try {
        const headers = req.headers || {};
        const contentType = headers["content-type"];
        if (!contentType)
          throw new Error("Missing required header: content-type");
        const lowerContentType = contentType.toLowerCase();
        if (lowerContentType !== "application/json" && !lowerContentType.startsWith("multipart/form-data")) {
          throw new Error("Invalid Content-Type header");
        }
        const validated = schema ? ValidateSchema.validateStructure(headers, schema, "headers", maxDepth) : { "content-type": contentType };
        req.context = req.context || {};
        req.context.headers = validated;
        next();
      } catch (err) {
        return next(ErrorHandlers.expressError(err.message, 400));
      }
    };
  }
  static validateRegex(validRegex, nameOfField, message) {
    return (req, res, next) => {
      if (!validRegex || !nameOfField || nameOfField.trim() === "") {
        return next(ErrorHandlers.expressError("Missing parameters in function!", 400));
      }
      const field = req.body[nameOfField];
      const personalizedMessage = message ? " " + message : "";
      if (!field || typeof field !== "string" || field.trim() === "") {
        return next(ErrorHandlers.expressError(`Missing ${nameOfField}`, 400));
      }
      if (!validRegex.test(field)) {
        return next(ErrorHandlers.expressError(`Invalid ${nameOfField} format!${personalizedMessage}`, 400));
      }
      next();
    };
  }
  static paramId(fieldName, validator) {
    return (req, res, next) => {
      const id = req.params[fieldName];
      if (!id) {
        next(ErrorHandlers.expressError(`Missing ${fieldName}`, 400));
        return;
      }
      const isValid = typeof validator === "function" ? validator(id) : validator.test(id);
      if (!isValid) {
        next(ErrorHandlers.expressError("Invalid parameters", 400));
        return;
      }
      next();
    };
  }
}
__publicField(Validator, "ValidReg", AuxValid.ValidReg);
class NodeValidator {
  static validateRegex(data, validRegex, nameOfField, message) {
    if (!validRegex || !nameOfField || nameOfField.trim() === "") {
      return ErrorHandlers.nodeError("Missing parameters in function!", "REQUIRED_FIELD_MISSING");
    }
    const field = data[nameOfField];
    const personalizedMessage = message ? " " + message : "";
    if (!field || typeof field !== "string" || field.trim() === "") {
      return ErrorHandlers.nodeError(`Missing ${nameOfField}`, "REQUIRED_FIELD_MISSING");
    }
    if (!validRegex.test(field)) {
      return ErrorHandlers.nodeError(`Invalid ${nameOfField} format!${personalizedMessage}`, "INVALID_FORMAT");
    }
    return data;
  }
  static paramId(data, fieldName, validator) {
    const id = data[fieldName];
    if (!id) {
      return ErrorHandlers.nodeError(`Missing ${fieldName}`, "REQUIRED_FIELD_MISSING");
    }
    const isValid = typeof validator === "function" ? validator(id) : validator.test(id);
    if (!isValid) {
      return ErrorHandlers.nodeError("Invalid parameters", "INVALID_INPUT");
    }
    return id;
  }
}
__publicField(NodeValidator, "validateBody", (data, schema, maxDepth = 10) => {
  try {
    const validated = ValidateSchema.validateStructure(data, schema, void 0, maxDepth);
    return validated;
  } catch (err) {
    return ErrorHandlers.nodeError(err.message, "VALIDATION_ERROR");
  }
});
__publicField(NodeValidator, "validateQuery", (data, schema, rules = {}, maxDepth = 5) => {
  try {
    const validated = ValidateSchema.validateStructure(data, schema, void 0, maxDepth);
    ValidateSchema.allowedValuesByRules(validated, rules);
    return validated;
  } catch (err) {
    return ErrorHandlers.nodeError(err.message, "VALIDATION_ERROR");
  }
});
__publicField(NodeValidator, "ValidReg", AuxValid.ValidReg);
__publicField(NodeValidator, "splitObjectProps", (obj, propsToExtract) => AuxValid.splitObjectProps(obj, propsToExtract));
const auth = {
  login: (data) => {
    const verifiedData = NodeValidator.validateBody(data, authlogin);
    console.log("verifiedData", verifiedData);
    return authService.login(verifiedData);
  },
  getSession: (sessionId) => {
    return authService.verifyService(sessionId, "USER");
  },
  logout: (sessionId) => {
    return authService.logout(sessionId);
  }
};
function authIpc() {
  ipcMain.handle(
    "auth:login",
    wrapIpcHandler(
      (_event, data) => auth.login(data),
      "auth:login"
    )
  ), ipcMain.handle(
    "auth:getSession",
    wrapIpcHandler(
      (_event, sessionId) => auth.getSession(sessionId),
      "auth:getSession"
    )
  ), ipcMain.handle(
    "auth:logout",
    wrapIpcHandler(
      (_event, sessionId) => auth.logout(sessionId),
      "auth:logout"
    )
  );
}
const withAuth = (handler, requiredRole) => {
  return async (event, data) => {
    if (!data || !data.sessionId) {
      throwError("No session provided", ErrorCode$1.ACCESS_DENIED);
    }
    const sessionData = await authService.verifyService(data.sessionId, requiredRole);
    return handler(event, { ...data, sessionClient: sessionData });
  };
};
const updateProfileSchema = {
  id: {
    type: "string"
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
const createUserSchema = {
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
const changeStatusSchema = {
  id: {
    type: "string"
  },
  enabled: {
    type: "boolean",
    default: true
  }
};
const changeRoleSchema = {
  id: {
    type: "string"
  },
  role: {
    type: "string"
  }
};
const changePasswordSchema = {
  id: {
    type: "string"
  },
  password: {
    type: "string"
  },
  newPassword: {
    type: "string"
  }
};
const user = {
  createUser: async (data) => {
    const valid = NodeValidator.validateBody(data, createUserSchema);
    const response = await userService.createUser(valid);
    return response;
  },
  getUsers: () => {
    return userService.getAll();
  },
  getUserById: (id) => {
    const validId = NodeValidator.paramId("id", id, NodeValidator.ValidReg.UUIDv4);
    return userService.getById(validId);
  },
  updateUserProfile: (data) => {
    const validData = NodeValidator.validateBody(data, updateProfileSchema);
    const { id, rest } = NodeValidator.splitObjectProps(validData, ["id"]);
    const validId = NodeValidator.paramId("id", id, NodeValidator.ValidReg.UUIDv4);
    return userService.updateProfile(validId, rest);
  },
  updateStatusUser: (data) => {
    const validData = NodeValidator.validateBody(data, changeStatusSchema);
    const { id, enabled } = NodeValidator.splitObjectProps(validData, ["id"]);
    const validId = NodeValidator.paramId("id", id, NodeValidator.ValidReg.UUIDv4);
    return userService.changeStatus(validId, enabled);
  },
  updateRoleUser: (data) => {
    const validData = NodeValidator.validateBody(data, changeRoleSchema);
    const { id, role } = NodeValidator.splitObjectProps(validData, ["id"]);
    const validId = NodeValidator.paramId("id", id, NodeValidator.ValidReg.UUIDv4);
    return userService.changeRole(validId, role);
  },
  updatePasswordUser: (data) => {
    const validData = NodeValidator.validateBody(data, changePasswordSchema);
    const { id, password, newPassword } = NodeValidator.splitObjectProps(validData, ["id"]);
    const validId = NodeValidator.paramId("id", id, NodeValidator.ValidReg.UUIDv4);
    return userService.changePassword(validId, password, newPassword);
  }
};
function userIpc() {
  ipcMain.handle(
    "user:create",
    wrapIpcHandler(
      withAuth(async (_event, data) => {
        return await user.createUser(data);
      }, "ADMIN"),
      // Si quieres restringir crear usuarios solo a ADMIN, pásalo aquí.
      "user:create"
    )
  ), ipcMain.handle(
    "users.getAll",
    wrapIpcHandler(
      withAuth(async (_event) => {
        return await user.getUsers();
      }),
      "user:getAll"
    )
  );
}
const modules = [
  authIpc,
  userIpc
];
function registerAllIpc() {
  modules.forEach((register) => register());
}
const clientSeed = [{
  "client_id": "019d881b-8dcc-75b9-a539-a130286cfcdb",
  "email": "josecliente@gmail.com",
  "name": "jose cliente",
  "type_doc": "DNI",
  "identity_code": "44577891",
  "address": "calle no se SN",
  "phone": "sin phone"
}];
const usersSeed = [
  {
    "user_id": "019d60b0-8fcd-7339-b8ea-9f16df713fb1",
    "email": "pericodelospalotes@gmail.com",
    "password": "L1234567",
    "role": "ADMIN",
    "user_name": "Pedro del madero",
    "nickname": "pericodelospalotes"
  },
  {
    "user_id": "019d63fc-c2a9-745f-b742-ef36545d98a8",
    "email": "antoniorodrigueztkds@gmail.com",
    "password": "L1234567",
    "role": "USER",
    "user_name": "No name",
    "nickname": "antoniorodrigueztkds"
  },
  {
    "user_id": "019d63fd-5d67-774a-b8ea-b97f571a99dc",
    "email": "josenomeacuerdo@gmail.com",
    "password": "L1234567",
    "role": "USER",
    "user_name": "No name",
    "nickname": "josenomeacuerdo"
  }
];
const userseed = userService;
const userRepo = new BaseRepository("users", "user_id");
const clientseed = new BaseRepository("clients", "client_id");
const dataSeedUsers = async (seeds) => {
  const users2 = await userseed.getAll();
  if (users2.length > 0) {
    console.log(`La db ya contiene usuarios`);
  } else {
    const usersCreated = seeds.map(async (s) => {
      const hashedPassword = await Hasher.hash(s.password);
      const userToInsert = {
        ...s,
        password: hashedPassword
      };
      return userRepo.create(userToInsert);
    });
    await Promise.all(usersCreated);
    console.log(`la tabla usuarios fue poblada con datos`);
  }
};
const dataSeedclient = async (seeds) => {
  const users2 = clientseed.getAll();
  if (users2.results.length > 0) {
    console.dir(users2.results);
    console.log(`La db ya contiene clientes`);
  } else {
    seeds.forEach((s) => clientseed.create(s));
    console.log(`la tabla clientes fue poblada con datos`);
  }
};
const fillDbWithSeeds = async () => {
  await Promise.all([
    dataSeedUsers(usersSeed),
    dataSeedclient(clientSeed)
  ]);
};
createRequire(import.meta.url);
const __dirname$1 = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
async function bootstrap() {
  try {
    await startUp(true);
    await fillDbWithSeeds();
    await app.whenReady();
    registerAllIpc();
    createWindow();
    console.log("todo bien");
  } catch (error) {
    console.error(error);
    app.quit();
  }
}
bootstrap();
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
