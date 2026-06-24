import { Patient, PatientCreate, PatientProps } from './Patient.js';
import { PatientRepository, PatientPersistence } from './PatientRepository.js';
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
    const persistenceData = patient.toPersistence() as PatientPersistence;
    
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

  getAllPatients() {
    const response = this.repository.getAll();
    if (!response.results) return [];
    
    // Mapear cada registro a una Entidad y luego a DTO
    return response.results.map((props: PatientProps) => new Patient(props).toDTO());
  }

  updatePatientContact(id: string, phone: string, email: string | null) {
    const patientProps = this.repository.getById(id);
    if (!patientProps) throw new Error('Patient not found');
    
    const patient = new Patient(patientProps);
    
    // Esta función del dominio verifica la mayoría de edad y asigna los datos
    patient.updateContactData(phone, email);
    
    const updatedProps = patient.toPersistence() as Partial<PatientPersistence>;
    
    // Actualizamos solo los campos que cambiaron
    this.repository.update(id, {
      phone: updatedProps.phone,
      email: updatedProps.email,
      age: updatedProps.age
    });

    return patient.toDTO();
  }

  deletePatient(id: string) {
    return this.repository.delete(id);
  }
}
