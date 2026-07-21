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

  create(data: HistoryEntryInsert, diagnosisIds: string[] = []): string {
    this.baseRepo.create(data);
    const entryId = data.entry_id;
    if (diagnosisIds && diagnosisIds.length > 0) {
      this.linkDiagnoses(entryId!, diagnosisIds);
    }
    return entryId!;
  }

  linkDiagnoses(entryId: string, diagnosisIds: string[]) {
    // Primero limpiamos los existentes (por si es un update)
    db.db.prepare(`DELETE FROM entry_diagnoses WHERE entry_id = ?`).run(entryId);
    
    // Luego insertamos los nuevos
    const stmt = db.db.prepare(`INSERT INTO entry_diagnoses (entry_id, diagnosis_id) VALUES (?, ?)`);
    const insertMany = db.db.transaction((ids: string[]) => {
      for (const id of ids) {
        stmt.run(entryId, id);
      }
    });
    insertMany(diagnosisIds);
  }

  getLinkedDiagnoses(entryId: string): string[] {
    const stmt = db.db.prepare(`SELECT diagnosis_id FROM entry_diagnoses WHERE entry_id = ?`);
    const rows = stmt.all(entryId) as { diagnosis_id: string }[];
    return rows.map(r => r.diagnosis_id);
  }

  getByPatientId(patientId: string, professionalId?: string): HistoryEntryProps[] {
    let query = `SELECT * FROM history_entry WHERE patient_id = ? AND deleted_at IS NULL`;
    const params:string[] = [patientId];
    if (professionalId) {
      query += ` AND professional_id = ?`;
      params.push(professionalId);
    }
    query += ` ORDER BY visit_date DESC, created_at DESC`;
    const stmt = db.db.prepare(query);
    const rows = stmt.all(...params) as DbHistoryEntry[];
    return rows.map(row => {
      const parsed = CaseConverter.mapKeysToCamelCase<HistoryEntryProps & { diagnosisIds?: string[] }>(row);
      parsed.diagnosisIds = this.getLinkedDiagnoses(parsed.entryId);
      return parsed;
    });
  }

  getById(id: string): (HistoryEntryProps & { diagnosisIds?: string[] }) | null {
    const result = this.baseRepo.getById(id);
    if (!result.results) return null;
    const data = result.results as HistoryEntryProps & { diagnosisIds?: string[] };
    data.diagnosisIds = this.getLinkedDiagnoses(data.entryId);
    return data;
  }

  update(id: string, data: Partial<DbHistoryEntry>) {
    return this.baseRepo.update(id, data);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }
}
