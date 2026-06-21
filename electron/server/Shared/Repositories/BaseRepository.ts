import { db } from "../../Configs/database.js";
import { IBaseRepository, IResponse } from "../Interfaces/base.interface.js";
import { CaseConverter } from "../Utils/CaseConverter.js";


export class BaseRepository<TEntity, TCreate extends Record<string, any>, TUpdate extends Record<string, any>> implements IBaseRepository<TEntity, TCreate, TUpdate> {
  private readonly modelName: string;
  private readonly pkColumn: string;

  constructor(modelName: string, pkColumn: string = 'id') {
    this.modelName = modelName;
    this.pkColumn = pkColumn;
  }
   
  /* CREATE */
  create(data: TCreate): IResponse<string> {
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
  getById(id: string | number): IResponse<TEntity | null> {
    const dbData = db.db.prepare(`
      SELECT *
      FROM ${this.modelName}
      WHERE ${this.pkColumn} = ?
    `).get(id) as TEntity | undefined;
    
    return {
      message: `Get by ID ${id} from ${this.modelName}`,
      results: dbData ? CaseConverter.mapKeysToCamelCase<TEntity>(dbData) : null
    };
  }

  /* UPDATE */
  update(id: string | number, data: TUpdate): IResponse<TEntity | null> {
    const snakeCaseData = CaseConverter.mapKeysToSnakeCase(data);
    const columns = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
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
      results: updatedData ? CaseConverter.mapKeysToCamelCase<TEntity>(updatedData) : null
    };
  }

  /* DELETE */
  delete(id: string | number): IResponse<string> {
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
  getAll(): IResponse<TEntity[] | []> {
    const dataSql = `
      SELECT *
      FROM ${this.modelName}
    `;

    const results = db.db.prepare(dataSql).all() as TEntity[];
    
    return {
      message: `Get all from ${this.modelName}`,
      results: results.map(row => CaseConverter.mapKeysToCamelCase<TEntity>(row))
    };
  }
}
