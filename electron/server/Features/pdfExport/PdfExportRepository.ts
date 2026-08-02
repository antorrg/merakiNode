import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { PdfExportProps } from './PdfExport.js';
import { PdfExports as DbPdfExport } from '../../dbTypes/db.types.js';

type PdfExportInsert = Omit<DbPdfExport, 'created_at'>;

export class PdfExportRepository {
  private baseRepo: BaseRepository<PdfExportProps, PdfExportInsert, Partial<DbPdfExport>>;

  constructor() {
    this.baseRepo = new BaseRepository<PdfExportProps, PdfExportInsert, Partial<DbPdfExport>>('pdf_exports', 'id', false);
  }

  create(data: PdfExportInsert): string {
    this.baseRepo.create(data);
    return data.id!;
  }

  getByPatientId(patientId: string): PdfExportProps[] {
    const stmt = db.db.prepare(`SELECT * FROM pdf_exports WHERE patient_id = ? ORDER BY created_at DESC`);
    const rows = stmt.all(patientId) as DbPdfExport[];
    return rows.map((row: DbPdfExport) => {
      const parsed = CaseConverter.mapKeysToCamelCase<PdfExportProps>(row);
      if (typeof parsed.visitIds === 'string') {
        try {
          parsed.visitIds = JSON.parse(parsed.visitIds as unknown as string);
        } catch {
          parsed.visitIds = [];
        }
      }
      return parsed;
    });
  }

  getById(id: string): PdfExportProps | null {
    const result = this.baseRepo.getById(id);
    if (!result.results) return null;
    const parsed = CaseConverter.mapKeysToCamelCase<PdfExportProps>(result.results);
    if (typeof parsed.visitIds === 'string') {
      try {
        parsed.visitIds = JSON.parse(parsed.visitIds as unknown as string);
      } catch {
        parsed.visitIds = [];
      }
    }
    return parsed;
  }
}
