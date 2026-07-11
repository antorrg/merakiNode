import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { HistoryEntryProps } from './HistoryEntry.js';
import { HistoryEntry as DbHistoryEntry } from '../../dbTypes/db.types.js';

type HistoryEntryInsert = Omit<DbHistoryEntry, 'created_at' | 'updated_at' | 'deleted_at'>;

export class HistoryEntryRepository {
  private baseRepo: BaseRepository<HistoryEntryProps, HistoryEntryInsert, Partial<DbHistoryEntry>>;

  constructor() {
    this.baseRepo = new BaseRepository<HistoryEntryProps, HistoryEntryInsert, Partial<DbHistoryEntry>>('history_entry', 'entry_id', true);
  }

  create(data: HistoryEntryInsert): string {
    return this.baseRepo.create(data) as unknown as string;
  }

  getByPatientId(patientId: string): HistoryEntryProps[] {
    const stmt = db.db.prepare(`SELECT * FROM history_entry WHERE patient_id = ? AND deleted_at IS NULL ORDER BY visit_date DESC, created_at DESC`);
    const rows = stmt.all(patientId) as DbHistoryEntry[];
    return rows.map(row => CaseConverter.mapKeysToCamelCase<HistoryEntryProps>(row));
  }

  getById(id: string): HistoryEntryProps | null {
    const result = this.baseRepo.getById(id);
    return result.results || null;
  }

  update(id: string, data: Partial<DbHistoryEntry>) {
    return this.baseRepo.update(id, data);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }
}
