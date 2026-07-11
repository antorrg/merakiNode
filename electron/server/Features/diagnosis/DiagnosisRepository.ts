import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { DiagnosisProps } from './Diagnosis.js';
import { Diagnosis as DbDiagnosis } from '../../dbTypes/db.types.js';

type DiagnosisInsert = Omit<DbDiagnosis, 'created_at' | 'updated_at' | 'deleted_at'>;

export class DiagnosisRepository {
  private baseRepo: BaseRepository<DiagnosisProps, DiagnosisInsert, Partial<DbDiagnosis>>;

  constructor() {
    this.baseRepo = new BaseRepository<DiagnosisProps, DiagnosisInsert, Partial<DbDiagnosis>>('diagnosis', 'diagnosis_id', true);
  }

  create(data: DiagnosisInsert): string {
    return this.baseRepo.create(data) as unknown as string;
  }

  getByPatientId(patientId: string): DiagnosisProps[] {
    const stmt = db.db.prepare(`SELECT * FROM diagnosis WHERE patient_id = ? AND deleted_at IS NULL ORDER BY start_date DESC`);
    const rows = stmt.all(patientId) as DbDiagnosis[];
    return rows.map(row => CaseConverter.mapKeysToCamelCase<DiagnosisProps>(row));
  }

  getById(id: string): DiagnosisProps | null {
    const result = this.baseRepo.getById(id);
    return result.results || null;
  }

  update(id: string, data: Partial<DbDiagnosis>) {
    return this.baseRepo.update(id, data);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }
}
