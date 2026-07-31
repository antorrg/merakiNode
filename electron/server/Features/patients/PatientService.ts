import { Patient, PatientCreate, PatientProps, GuardianRelation } from './Patient.js';
import { PatientRepository } from './PatientRepository.js';
import { Patients } from '../../dbTypes/db.types.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

export class PatientService {
  private repository: PatientRepository;

  constructor() {
    this.repository = new PatientRepository();
  }

  registerPatient(data: PatientCreate) {
    // 1. Generar relationId para los tutores si no viene desde el frontend
    if (data.guardians) {
      data.guardians = data.guardians.map(g => ({
        ...g,
        relationId: g.relationId || UuidHandler.idCreator()
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

  updatePatientContact(id: string, data: any, emailArg?: string | null) {
    let firstName: string | undefined;
    let lastName: string | undefined;
    let typeDoc: string | undefined;
    let identityCode: string | undefined;
    let birthDate: string | undefined;
    let phone: string | undefined;
    let email: string | null | undefined;
    let address: string | undefined;
    let city: string | undefined;
    let postalCode: string | undefined;
    let guardiansData: any[] | undefined;

    if (typeof data === 'string') {
      phone = data;
      email = emailArg;
    } else if (data && typeof data === 'object') {
      firstName = data.firstName;
      lastName = data.lastName;
      typeDoc = data.typeDoc;
      identityCode = data.identityCode;
      birthDate = data.birthDate;
      phone = data.phone;
      email = data.email;
      address = data.address;
      city = data.city;
      postalCode = data.postalCode;
      guardiansData = data.guardians;
    }

    const patientProps = this.repository.getById(id);
    if (!patientProps) throw new Error('Patient not found');

    let updatedGuardians: GuardianRelation[] | undefined;
    if (Array.isArray(guardiansData)) {
      updatedGuardians = guardiansData.map((g: any) => {
        let guardianProps: PatientProps;
        const gId = g.guardianId || g.guardian?.patientId || g.guardianId;
        if (gId) {
          const found = this.repository.getById(gId);
          if (!found) throw new Error(`Guardian patient ${gId} not found`);
          guardianProps = found;
        } else if (g.guardian) {
          guardianProps = g.guardian;
        } else {
          throw new Error('Guardian information missing');
        }

        return {
          relationId: g.relationId || UuidHandler.idCreator(),
          guardian: guardianProps,
          relationshipType: g.relationshipType || g.relationship || 'Otro',
          isPrimaryContact: Boolean(g.isPrimaryContact ?? g.isPrimary)
        };
      });
    }

    const effectiveGuardians = updatedGuardians !== undefined ? updatedGuardians : (patientProps.guardians || []);

    const updatedPropsForEntity: PatientProps = {
      ...patientProps,
      firstName: (firstName !== undefined && firstName !== null) ? firstName : patientProps.firstName,
      lastName: (lastName !== undefined && lastName !== null) ? lastName : patientProps.lastName,
      typeDoc: (typeDoc !== undefined && typeDoc !== null) ? typeDoc : patientProps.typeDoc,
      identityCode: (identityCode !== undefined && identityCode !== null) ? identityCode : patientProps.identityCode,
      birthDate: (birthDate !== undefined && birthDate !== null) ? birthDate : patientProps.birthDate,
      phone: phone !== undefined ? phone : patientProps.phone,
      email: email !== undefined ? email : patientProps.email,
      address: (address !== undefined && address !== null) ? address : patientProps.address,
      city: (city !== undefined && city !== null) ? city : patientProps.city,
      postalCode: (postalCode !== undefined && postalCode !== null) ? postalCode : patientProps.postalCode,
      guardians: effectiveGuardians
    };

    const patient = new Patient(updatedPropsForEntity);

    // Validar requerimientos de edad del dominio
    Patient.validateAgeRequirements(patient.toPersistence().age, patient.toPersistence().phone, effectiveGuardians);

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

    return this.getPatientById(id);
  }

  deletePatient(id: string) {
    return this.repository.delete(id);
  }
}
