import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { patients, diagnosis } from '../../Schema/schema.js';
import { DiagnosisService } from './DiagnosisService.js';
import { DiagnosisRepository } from './DiagnosisRepository.js';
import { DiagnosisStatus } from './Diagnosis.js';
import { PatientService } from '../patients/PatientService.js';

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}));

describe('DiagnosisService (SQLite Integration)', () => {
  let diagnosisService: DiagnosisService;
  let patientService: PatientService;
  let testPatientId: string;

  beforeAll(() => {
    // Inicializar tablas necesarias
    db.db.exec(patients.sql);
    db.db.exec(diagnosis.sql);
    
    diagnosisService = new DiagnosisService(new DiagnosisRepository());
    patientService = new PatientService();

    // Crear un paciente de prueba para asociarle los diagnósticos
    const patientData = {
      email: 'test@test.com',
      firstName: 'Juan',
      lastName: 'Perez',
      typeDoc: 'DNI',
      identityCode: '11111111',
      birthDate: '01/01/1990',
      phone: '1234567890',
      address: 'Calle 1',
      city: 'Ciudad',
      postalCode: '1000'
    };
    const patient = patientService.registerPatient(patientData);
    testPatientId = patient.patientId;
  });

  afterAll(() => {
    // Limpieza
    db.db.exec(`DROP TABLE IF EXISTS diagnosis;`);
    db.db.exec(`DROP TABLE IF EXISTS patients;`);
  });

  it('debería agregar un diagnóstico a un paciente', () => {
    const result = diagnosisService.addDiagnosisToPatient({
      patientId: testPatientId,
      title: 'Hipertensión',
      description: 'Presión arterial alta detectada en controles',
      startDate: '2026-06-01',
      status: DiagnosisStatus.ACTIVE
    });

    expect(result).toBeDefined();
    expect(result.diagnosisId).toBeDefined();
    expect(result.title).toBe('Hipertensión');
    expect(result.status).toBe(DiagnosisStatus.ACTIVE);
  });

  it('debería fallar si el título del diagnóstico es inválido (Domain test integrado)', () => {
    expect(() => {
      diagnosisService.addDiagnosisToPatient({
        patientId: testPatientId,
        title: '',
        description: 'Vacio',
        startDate: '2026-06-01',
        status: DiagnosisStatus.ACTIVE
      });
    }).toThrow('El título del diagnóstico es inválido');
  });

  it('debería obtener los diagnósticos de un paciente', () => {
    // Agregamos otro diagnóstico
    diagnosisService.addDiagnosisToPatient({
      patientId: testPatientId,
      title: 'Asma',
      description: 'Asma leve',
      startDate: '2026-06-10',
      status: DiagnosisStatus.CHRONIC
    });

    const list = diagnosisService.getPatientDiagnoses(testPatientId);
    expect(list).toHaveLength(2);
    // Deberían venir ordenados por start_date DESC (el de Asma es más reciente, '2026-06-10')
    expect(list[0].title).toBe('Asma');
    expect(list[1].title).toBe('Hipertensión');
  });

  it('debería actualizar un diagnóstico (resolverlo)', () => {
    const list = diagnosisService.getPatientDiagnoses(testPatientId);
    const diagToUpdate = list.find(d => d.title === 'Hipertensión');
    expect(diagToUpdate).toBeDefined();

    const updated = diagnosisService.updateDiagnosis(diagToUpdate!.diagnosisId, {
      status: DiagnosisStatus.RESOLVED,
      endDate: '2026-06-30'
    });

    expect(updated.status).toBe(DiagnosisStatus.RESOLVED);
    expect(updated.endDate).toBe('2026-06-30');

    // Verificar que persistió en la BD
    const listAgain = diagnosisService.getPatientDiagnoses(testPatientId);
    const verified = listAgain.find(d => d.diagnosisId === diagToUpdate!.diagnosisId);
    expect(verified!.status).toBe(DiagnosisStatus.RESOLVED);
    expect(verified!.endDate).toBe('2026-06-30');
  });

  it('debería borrar un diagnóstico lógicamente', () => {
    const list = diagnosisService.getPatientDiagnoses(testPatientId);
    const diagToDelete = list[0]; // Asma

    const result = diagnosisService.deleteDiagnosis(diagToDelete.diagnosisId);
    expect(result).toBeDefined();

    // Verificamos que ya no aparezca en la lista de diagnósticos activos/no-borrados
    const listAfterDelete = diagnosisService.getPatientDiagnoses(testPatientId);
    expect(listAfterDelete).toHaveLength(1);
    expect(listAfterDelete.find(d => d.diagnosisId === diagToDelete.diagnosisId)).toBeUndefined();
  });
});
