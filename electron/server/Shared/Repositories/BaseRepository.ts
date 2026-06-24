import { db } from "../../Configs/database.js";
import { IBaseRepository, IResponse } from "../Interfaces/base.interface.js";
import { CaseConverter } from "../Utils/CaseConverter.js";


export class BaseRepository<TEntity, TCreate extends Record<string, any>, TUpdate extends Record<string, any>> implements IBaseRepository<TEntity, TCreate, TUpdate> {
  private readonly modelName: string;
  private readonly pkColumn: string;
  private readonly useSoftDelete: boolean;
  private readonly useCaseConversion: boolean;

  constructor(modelName: string, pkColumn: string = 'id', useSoftDelete: boolean = false, useCaseConversion: boolean = true) {
    this.modelName = modelName;
    this.pkColumn = pkColumn;
    this.useSoftDelete = useSoftDelete;
    this.useCaseConversion = useCaseConversion;
  }
   
  /* CREATE */
  create(data: TCreate): IResponse<string> {
    const processedData = this.useCaseConversion ? CaseConverter.mapKeysToSnakeCase(data) : data;
    const columns = Object.keys(processedData);
    const values = Object.values(processedData);
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
  getById(id: string | number): IResponse<TEntity | null> {
    const query = this.useSoftDelete
      ? `SELECT * FROM ${this.modelName} WHERE ${this.pkColumn} = ? AND deleted_at IS NULL`
      : `SELECT * FROM ${this.modelName} WHERE ${this.pkColumn} = ?`;

    const dbData = db.db.prepare(query).get(id) as TEntity | undefined;
    
    return {
      message: `Get by ID ${id} from ${this.modelName}`,
      results: dbData ? (this.useCaseConversion ? CaseConverter.mapKeysToCamelCase<TEntity>(dbData) : dbData as unknown as TEntity) : null
    };
  }

  /* UPDATE */
  update(id: string | number, data: TUpdate): IResponse<TEntity | null> {
    const processedData = this.useCaseConversion ? CaseConverter.mapKeysToSnakeCase(data) : data;
    const columns = Object.keys(processedData);
    const values = Object.values(processedData);
    const setClause = columns.map(col => `${col} = ?`).join(", ");
    
    // Using RETURNING * to return the updated entity
    const stmt = db.db.prepare(`
      UPDATE ${this.modelName}
      SET ${setClause}
      WHERE ${this.pkColumn} = ?
      RETURNING *
    `);

    const updatedData = stmt.get(...values, id) as TEntity | undefined;

    return {
      message: `Updated ID ${id} in ${this.modelName}`,
      results: updatedData ? (this.useCaseConversion ? CaseConverter.mapKeysToCamelCase<TEntity>(updatedData) : updatedData as unknown as TEntity) : null
    };
  }

  /* DELETE */
  delete(id: string | number): IResponse<string> {
    if (this.useSoftDelete) {
      const result = db.db.prepare(`
        UPDATE ${this.modelName}
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE ${this.pkColumn} = ?
      `).run(id);
      
      return {
        message: `Soft deleted ID ${id} in ${this.modelName}`,
        results: result.changes.toString()
      };
    } else {
      const result = db.db.prepare(`
        DELETE FROM ${this.modelName}
        WHERE ${this.pkColumn} = ?
      `).run(id);
      
      return {
        message: `Deleted ID ${id} from ${this.modelName}`,
        results: result.changes.toString()
      };
    }
  }

  /* GET ALL */
  getAll(): IResponse<TEntity[] | []> {
    const dataSql = this.useSoftDelete
      ? `SELECT * FROM ${this.modelName} WHERE deleted_at IS NULL`
      : `SELECT * FROM ${this.modelName}`;

    const results = db.db.prepare(dataSql).all() as TEntity[];
    
    return {
      message: `Get all from ${this.modelName}`,
      results: this.useCaseConversion ? results.map(row => CaseConverter.mapKeysToCamelCase<TEntity>(row)) : results
    };
  }
}
