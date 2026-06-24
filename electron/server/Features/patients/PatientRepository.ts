import { BaseRepository } from '../../Shared/Repositories/BaseRepository.js';
import { db } from '../../Configs/database.js';
import { CaseConverter } from '../../Shared/Utils/CaseConverter.js';
import { PatientProps, GuardianRelation } from './Patient.js';

export interface PatientPersistence {
  patient_id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  type_doc: string;
  identity_code: string;
  birth_date: string;
  age: number;
  phone: string | null;
  address: string;
  city: string;
  postal_code: string;
}

export interface GuardianRelationRow extends PatientPersistence {
  relationId: string;
  relationshipType: string;
  isPrimaryContact: number;
}

export class PatientRepository {
  private baseRepo: BaseRepository<PatientProps, PatientPersistence, Partial<PatientPersistence>>;

  constructor() {
    this.baseRepo = new BaseRepository<PatientProps, PatientPersistence, Partial<PatientPersistence>>('patients', 'patient_id', true);
  }

  create(patientData: PatientPersistence, relations: GuardianRelation[]): string {
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
    return patientData.patient_id;
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

  update(id: string, patientData: Partial<PatientPersistence>) {
    return this.baseRepo.update(id, patientData);
  }

  delete(id: string) {
    return this.baseRepo.delete(id);
  }

  getAll() {
    // Retorna todos los pacientes sin hidratar las relaciones N:M por defecto (por rendimiento)
    return this.baseRepo.getAll();
  }
}
