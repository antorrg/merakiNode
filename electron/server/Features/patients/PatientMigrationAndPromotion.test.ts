import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Patient } from './Patient.js';
import { PatientRepository } from './PatientRepository.js';
import { PatientService } from './PatientService.js';
import { db } from '../../Configs/database.js';
import { patients, patient_relations } from '../../Schema/schema.js';

describe('Patient Domain & Service - Tutor vs Patient (is_patient)', () => {
  let repository: PatientRepository;
  let service: PatientService;

  beforeAll(() => {
    db.db.exec(patients.sql);
    db.db.exec(patient_relations.sql);
    repository = new PatientRepository();
    service = new PatientService(repository);
  });

  beforeEach(() => {
    db.db.exec('PRAGMA foreign_keys = OFF;');
    db.db.exec('DELETE FROM patient_relations;');
    db.db.exec('DELETE FROM patients;');
    db.db.exec('PRAGMA foreign_keys = ON;');
  });

  const getAdultProps = (identityCode: string, isPatient = true) => ({
    firstName: 'Carlos',
    lastName: 'Gomez',
    typeDoc: 'DNI',
    identityCode,
    birthDate: '10/10/1985',
    email: null,
    phone: '1122334455',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    postalCode: '1234',
    isPatient,
    guardians: []
  });

  it('debe registrar un tutor con isPatient = false y reflejarlo en toDTO y toPersistence', () => {
    const props = getAdultProps('99887766', false);
    const patient = Patient.register(props);

    expect(patient).toBeInstanceOf(Patient);
    expect(patient.toDTO().isPatient).toBe(false);
    expect(patient.toPersistence().is_patient).toBe(0);
  });

  it('debe filtrar tutores (is_patient = 0) del listado general sin búsqueda', () => {
    service.registerPatient(getAdultProps('11111111', false)); // Tutor
    service.registerPatient(getAdultProps('22222222', true));  // Paciente

    const result = service.getAllPatients({ page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].identityCode).toBe('22222222');
  });

  it('debe traer al tutor al buscar puntualmente por su DNI/identityCode', () => {
    service.registerPatient(getAdultProps('TUTOR-1234', false)); // Tutor con DNI alfanumérico

    // Al buscar por la clave del documento, debe incluirlo
    const result = service.getAllPatients({ search: 'TUTOR-1234', page: 1, limit: 10 });
    expect(result.data.length).toBe(1);
    expect(result.data[0].identityCode).toBe('TUTOR-1234');
    expect(result.data[0].isPatient).toBe(false);
  });

  it('debe permitir cambiar de forma reversible el estado isPatient mediante updatePatientContact', () => {
    // 1. Crear como paciente activo
    const created = service.registerPatient(getAdultProps('44444444', true));
    expect(created.isPatient).toBe(true);

    // 2. Desactivar como paciente (convertir a Solo Tutor)
    const deactivated = service.updatePatientContact(created.patientId, { isPatient: false });
    expect(deactivated.isPatient).toBe(false);

    // 3. Volver a activar como paciente activo (reversibilidad)
    const reactivated = service.updatePatientContact(created.patientId, { isPatient: true });
    expect(reactivated.isPatient).toBe(true);
  });
});
