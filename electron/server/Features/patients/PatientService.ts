import { Patient, PatientCreate, PatientProps, GuardianRelation, GuardianInput, PatientUpdateInput } from './Patient.js';
import { PatientRepository } from './PatientRepository.js';
import { Patients } from '../../dbTypes/db.types.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';
import { PatientApplications } from './applications/PatientApplications.js';


export class PatientService {
  private repository: PatientRepository;

  constructor(repository: PatientRepository = new PatientRepository()) {
    this.repository = repository;
  }

  registerPatient(data: PatientCreate) {
    // 1. Generar relationId para los tutores si no viene desde el frontend
    if (data.guardians) {
      data.guardians = data.guardians.map(g => ({
        ...g,
        relationId: g.relationId || UuidHandler.idCreator(),
        relationshipType: PatientApplications.relationshipType(g.relationshipType || g.relationship)
      }));
    }

    // 2. Instanciar y validar con el Modelo de Dominio
    const patient = Patient.register(data);
    const persistenceData = patient.toPersistence() as Omit<Patients, 'created_at'|'updated_at'|'deleted_at'>;
    
    // 3. Persistir en la base de datos (con transacciones)
    this.repository.create(persistenceData, data.guardians || []);

    // 4. Retornar el DTO seguro para el frontend
    return patient.toDTO();
  }

  getPatientById(id: string) {
    const patientProps = this.repository.getById(id);
    if (!patientProps) throw new Error('Patient not found');
    
    // Hidratar la entidad de Dominio para validar y devolver un DTO
    const patient = new Patient(patientProps);
    return patient.toDTO();
  }

  getAllPatients(options: unknown = {}) {
    const response = this.repository.getAll(options!);
    
    // Devolvemos el resultado paginado directamente ya que el repositorio
    // retorna una selección de campos parcial y no es necesario mapearlo todo a Entidad
    return response;
  }

  updatePatientContact(id: string, data: PatientUpdateInput | string, emailArg?: string | null) {
    let payload: Record<string, unknown> = {};

    if (typeof data === 'string') {
      if (data) payload.phone = data;
      if (emailArg !== undefined) payload.email = emailArg;
    } else if (data && typeof data === 'object') {
      payload = { ...data };
    }

    const patientProps = this.repository.getById(id);
    if (!patientProps) throw new Error('Patient not found');

    const patient = new Patient(patientProps);

    if (Object.keys(payload).length === 0) {
      return patient.toDTO();
    }

    let updatedGuardians: GuardianRelation[] | undefined;
    if (Array.isArray(payload.guardians)) {
      updatedGuardians = (payload.guardians as GuardianInput[]).map((g) => {
        let guardianProps: PatientProps;
        const gId = g.guardianId || g.guardian?.patientId;
        if (gId) {
          const found = this.repository.getById(gId);
          if (!found) throw new Error(`Guardian patient ${gId} not found`);
          guardianProps = found;
        } else if (g.guardian) {
          guardianProps = g.guardian;
        } else {
          throw new Error('Guardian information missing');
        }

        const relType = PatientApplications.relationshipType(g.relationshipType || g.relationship);
        return {
          relationId: g.relationId || UuidHandler.idCreator(),
          guardian: guardianProps,
          relationshipType: relType,
          relationship: relType,
          isPrimaryContact: Boolean(g.isPrimaryContact ?? g.isPrimary)
        };
      });
      payload.guardians = updatedGuardians;
    }

    const hasChanges = patient.update(payload);

    if (!hasChanges) {
      return patient.toDTO();
    }

    const persistenceData = patient.toPersistence() as Partial<Patients>;

    this.repository.update(id, {
      first_name: persistenceData.first_name,
      last_name: persistenceData.last_name,
      type_doc: persistenceData.type_doc,
      identity_code: persistenceData.identity_code,
      birth_date: persistenceData.birth_date,
      age: persistenceData.age,
      phone: persistenceData.phone,
      email: persistenceData.email,
      address: persistenceData.address,
      city: persistenceData.city,
      postal_code: persistenceData.postal_code
    }, updatedGuardians);

    return patient.toDTO();
  }

  deletePatient(id: string) {
    return this.repository.delete(id);
  }
}
