import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { PatientProps, GuardianRelation } from './Patient.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

import { Patients } from '../../dbTypes/db.types.js';

export interface GuardianRelationRow extends Patients {
  relationId: string;
  relationshipType: string;
  isPrimaryContact: number;
}
interface FindPatientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  deletedAt?: string | null;
}
export type PatientResult = Partial<PatientProps>
interface PaginatedResult<T> {
  info: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number
  }
  data: T[];
}


export class PatientRepository {
  private baseRepo: BaseRepository<PatientProps, Omit<Patients, 'created_at'|'updated_at'|'deleted_at'>, Partial<Patients>>;

  constructor() {
    this.baseRepo = new BaseRepository<PatientProps, Omit<Patients, 'created_at'|'updated_at'|'deleted_at'>, Partial<Patients>>('patients', 'patient_id', true);
  }

  create(patientData: Omit<Patients, 'created_at'|'updated_at'|'deleted_at'>, relations: GuardianRelation[]): string {
    const insertTransaction = db.db.transaction(() => {
      // 1. Guardar el paciente principal
      this.baseRepo.create(patientData);
      
      // 2. Guardar las relaciones (tutores)
      if (relations && relations.length > 0) {
        const stmt = db.db.prepare(`
          INSERT INTO patient_relations (relation_id, guardian_id, dependent_id, relationship_type, is_primary_contact)
          VALUES (?, ?, ?, ?, ?)
        `);
        for (const relation of relations) {
          stmt.run(
            relation.relationId,
            relation.guardian.patientId, // El tutor/guardián (que ya debe existir en la BD)
            patientData.patient_id,      // El paciente menor que acabamos de crear
            relation.relationshipType,
            relation.isPrimaryContact ? 1 : 0
          );
        }
      }
    });
    
    insertTransaction();
    return patientData.patient_id as string;
  }

  getById(id: string): PatientProps | null {
    // Obtener datos básicos del paciente usando el base repository
    const result = this.baseRepo.getById(id);
    if (!result.results) return null;
    
    const patientProps = result.results as PatientProps;
    
    // Obtener las relaciones donde este paciente es el dependiente (menor)
    const relationsStmt = db.db.prepare(`
      SELECT 
        pr.relation_id as "relationId",
        pr.relationship_type as "relationshipType",
        pr.is_primary_contact as "isPrimaryContact",
        p.*
      FROM patient_relations pr
      JOIN patients p ON pr.guardian_id = p.patient_id
      WHERE pr.dependent_id = ?
    `);
    const relationsDb = relationsStmt.all(id) as GuardianRelationRow[];

    // Mapear los datos traídos al formato esperado por el dominio
    const guardians: GuardianRelation[] = relationsDb.map(row => {
      const { relationId, relationshipType, isPrimaryContact, ...guardianRawData } = row;
      const guardianData = CaseConverter.mapKeysToCamelCase<PatientProps>(guardianRawData);
      
      return {
        relationId,
        relationshipType,
        isPrimaryContact: Boolean(isPrimaryContact),
        guardian: guardianData
      };
    });

    patientProps.guardians = guardians;
    return patientProps;
  }

  update(id: string, patientData: Partial<Patients>, relations?: GuardianRelation[]) {
    const updateTransaction = db.db.transaction(() => {
      this.baseRepo.update(id, patientData);

      if (relations !== undefined) {
        // Delete existing relations for this dependent
        db.db.prepare('DELETE FROM patient_relations WHERE dependent_id = ?').run(id);

        // Insert new relations
        if (relations.length > 0) {
          const stmt = db.db.prepare(`
            INSERT INTO patient_relations (relation_id, guardian_id, dependent_id, relationship_type, is_primary_contact)
            VALUES (?, ?, ?, ?, ?)
          `);
          for (const relation of relations) {
            stmt.run(
              relation.relationId || UuidHandler.idCreator(),
              relation.guardian.patientId,
              id,
              relation.relationshipType,
              relation.isPrimaryContact ? 1 : 0
            );
          }
        }
      }
    });

    updateTransaction();
    return true;
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }

  getAll(options: FindPatientsOptions): PaginatedResult<PatientResult> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 5));
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: Record<string, string | number> = {
      limit,
      offset,
    };

    if (options.search?.trim()) {
      if (options.searchField) {
        const allowedSearchFields: Record<string, string> = {
          'first_name': 'p.first_name',
          'last_name': 'p.last_name',
          'identity_code': 'p.identity_code',
          'firstName': 'p.first_name',
          'lastName': 'p.last_name',
          'identityCode': 'p.identity_code',
        };
        const searchField = allowedSearchFields[options.searchField];
        if (searchField) {
          where.push(`${searchField} LIKE @search COLLATE NOCASE`);
        } else {
          where.push(`(p.first_name LIKE @search COLLATE NOCASE OR p.last_name LIKE @search COLLATE NOCASE OR (p.first_name || ' ' || p.last_name) LIKE @search COLLATE NOCASE OR p.identity_code LIKE @search COLLATE NOCASE)`);
        }
      } else {
        where.push(`(p.first_name LIKE @search COLLATE NOCASE OR p.last_name LIKE @search COLLATE NOCASE OR (p.first_name || ' ' || p.last_name) LIKE @search COLLATE NOCASE OR p.identity_code LIKE @search COLLATE NOCASE)`);
      }
      params.search = `%${options.search.trim()}%`;
    }

    if (options.deletedAt !== undefined) {
      if (options.deletedAt === null) {
        where.push('p.deleted_at IS NULL');
      } else {
        where.push('p.deleted_at = @deleted_at');
        params.deleted_at = options.deletedAt;
      }
    } else {
      // By default return only active patients unless explicitly requested
      where.push('p.deleted_at IS NULL');
    }

    const whereClause =
      where.length > 0
        ? `WHERE ${where.join(' AND ')}`
        : '';

    const dataSql = `
      SELECT
        p.patient_id,
        p.email,
        p.first_name,
        p.last_name,
        p.type_doc,
        p.identity_code,
        p.deleted_at
      FROM patients as p
      ${whereClause}
      ORDER BY p.patient_id DESC
      LIMIT @limit
      OFFSET @offset
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM patients AS p
      ${whereClause}
    `;

    const rowsArr = db.db.prepare(dataSql).all(params);

    const countParams = { ...params };
    delete countParams.limit;
    delete countParams.offset;

    const countResult = db.db
      .prepare(countSql)
      .get(countParams) as { total: number };

    const totalItems = countResult.total;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      info: {
        page,
        limit,
        totalItems,
        totalPages
      },
      data: rowsArr.map(patient => CaseConverter.mapKeysToCamelCase<PatientResult>(patient))
    };
  }
}
