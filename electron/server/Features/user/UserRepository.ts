import {db as DatabaseInstance} from '../../Configs/database.js';
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { UserProps } from './User.js';
import { SqliteDb } from '../../Configs/dbConfigs/DatabaseClient.js';

import { Users } from '../../dbTypes/db.types.js';

export class UserRepository {
  private base: BaseRepository<UserProps, Omit<Users, 'created_at' | 'updated_at'>, Partial<Users>>;
  private db: SqliteDb;
  constructor(db: SqliteDb = DatabaseInstance) {
    this.base = new BaseRepository<UserProps, Omit<Users, 'created_at' | 'updated_at'>, Partial<Users>>('users', 'user_id');
    this.db = db;
  }
  async create(data: Omit<Users, 'created_at' | 'updated_at'>){
    const response = this.base.create(data);
    return response.results
  } 
  async update(id:string, data: Partial<Users>){
    const response =  this.base.update(id, data);
    return response.results
  }
  async delete(id:string){
    const response =  this.base.delete(id);
    return response.results
  } 
  async getById(id:string): Promise<UserProps | null> {
    const response = this.base.getById(id);
    return response.results as UserProps | null;
  }
  async getAll(): Promise<UserProps[]> {
    const response =  this.base.getAll();
    return response.results as UserProps[];
  }
  async findByEmail(email: string): Promise<UserProps | null> {
    const sql = ` SELECT * FROM users WHERE user_email = ? LIMIT 1 `
    const result = this.db.db.prepare(sql).get(email)
    return result ? CaseConverter.mapKeysToCamelCase(result) as UserProps : null;
  }
}
