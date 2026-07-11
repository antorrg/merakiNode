import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { TreatmentProps } from './Treatment.js';
import { Treatment as DbTreatment } from '../../dbTypes/db.types.js';

type TreatmentInsert = Omit<DbTreatment, 'created_at' | 'updated_at' | 'deleted_at'>;

export class TreatmentRepository {
  private baseRepo: BaseRepository<TreatmentProps, TreatmentInsert, Partial<DbTreatment>>;

  constructor() {
    this.baseRepo = new BaseRepository<TreatmentProps, TreatmentInsert, Partial<DbTreatment>>('treatment', 'treatment_id', true);
  }

  create(data: TreatmentInsert): string {
    return this.baseRepo.create(data) as unknown as string;
  }

  getByEntryId(entryId: string): TreatmentProps[] {
    const stmt = db.db.prepare(`SELECT * FROM treatment WHERE entry_id = ? AND deleted_at IS NULL ORDER BY created_at ASC`);
    const rows = stmt.all(entryId) as DbTreatment[];
    return rows.map(row => CaseConverter.mapKeysToCamelCase<TreatmentProps>(row));
  }

  getById(id: string): TreatmentProps | null {
    const result = this.baseRepo.getById(id);
    return result.results || null;
  }

  update(id: string, data: Partial<DbTreatment>) {
    return this.baseRepo.update(id, data);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }
}
