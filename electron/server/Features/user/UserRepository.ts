import {db as DatabaseInstance} from '../../Configs/database.js';
import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';

export class UserRepository {
  private base: BaseRepository<any, any, any>;
  private db: any;
  constructor(db: any = DatabaseInstance) {
    this.base = new BaseRepository('users', 'user_id');
    this.db = db;
  }
  async create(data:any){
    const response = this.base.create(data);
    return response.results
  } 
  async update(id:string, data:any){
    const response =  this.base.update(id, data);
    return response.results
  }
  async delete(id:string){
    const response =  this.base.delete(id);
    return response.results
  } 
  async getById(id:string){
    const response = this.base.getById(id);
    return response.results
  }
  async getAll(){
    const response =  this.base.getAll();
    return response.results
  }
  async findByEmail(email: string) {
    const sql = ` SELECT * FROM users WHERE email = ? LIMIT 1 `
    const result = this.db.db.prepare(sql).get(email)
    return result ? CaseConverter.mapKeysToCamelCase(result) : null;
  }
}
