import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { patients, patient_relations, users, history_entry, treatment, diagnosis, entry_diagnoses  } from '../../Schema/schema.js';
import { HistoryService } from './HistoryService.js';
import { HistoryEntryService } from './HistoryEntryService.js';
import { HistoryEntryRepository } from './HistoryEntryRepository.js';
import { TreatmentService } from '../treatment/TreatmentService.js';
import { TreatmentRepository } from '../treatment/TreatmentRepository.js';
import { DiagnosisService } from '../diagnosis/DiagnosisService.js';
import { DiagnosisRepository } from '../diagnosis/DiagnosisRepository.js';
import { PatientService } from '../patients/PatientService.js';
import { UserService } from '../user/UserService.js';
import { UserRepository } from '../user/UserRepository.js';
import { VisitType } from './HistoryEntry.js';
import { DiagnosisStatus } from '../diagnosis/Diagnosis.js';

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}));

describe('HistoryService (Orchestrator)', () => {
  let historyService: HistoryService;
  let testPatientId: string;

  beforeAll(async () => {
    db.db.exec(users.sql);
    db.db.exec(patients.sql);
    db.db.exec(patient_relations.sql);
    db.db.exec(history_entry.sql);
    db.db.exec(treatment.sql);
    db.db.exec(diagnosis.sql);
    db.db.exec(entry_diagnoses.sql);
    

    const userService = new UserService(new UserRepository());
    const patientService = new PatientService();
    const diagnosisService = new DiagnosisService(new DiagnosisRepository());
    const entryService = new HistoryEntryService(new HistoryEntryRepository());
    const treatmentService = new TreatmentService(new TreatmentRepository());
    
    historyService = new HistoryService(patientService, diagnosisService, entryService, treatmentService, userService);

    // 1. Crear Profesional
    const userResult = await userService.createUser({
      userEmail: 'dr_orchestrator@test.com',
      password: '123',
      userName: 'Dr. Orchestrator',
      role: 'ADMIN'
    });

    await userService.updateProfile(userResult.userId, {
      userEmail: 'dr_orchestrator@test.com',
      userName: 'Dr. Orchestrator',
      nickname: 'dr'
    });

    // 2. Crear Paciente
    const patientResult = patientService.registerPatient({
      email: 'p_orch@test.com',
      firstName: 'Maria',
      lastName: 'Lopez',
      typeDoc: 'DNI',
      identityCode: '44444444',
      birthDate: '01/01/2000',
      phone: '123123123',
      address: 'Calle Falsa 123',
      city: 'Springfield',
      postalCode: '1234'
    });
    testPatientId = patientResult.patientId;

    // 3. Crear Diagnósticos (Uno activo, uno resuelto)
    diagnosisService.addDiagnosisToPatient({
      patientId: testPatientId,
      title: 'TDAH',
      description: 'Déficit de atención',
      startDate: '2023-01-01',
      status: DiagnosisStatus.ACTIVE
    });

    const resolvedDiag = diagnosisService.addDiagnosisToPatient({
      patientId: testPatientId,
      title: 'Fobia Social',
      description: 'Superada',
      startDate: '2022-01-01',
      status: DiagnosisStatus.ACTIVE
    });
    diagnosisService.updateDiagnosis(resolvedDiag.diagnosisId, { status: DiagnosisStatus.RESOLVED, endDate: '2024-01-01' });

    // 4. Crear Evoluciones/Visitas y Tratamientos
    const entryResult = entryService.addEntry({
      patientId: testPatientId,
      professionalId: userResult.userId,
      visitType: VisitType.PRESENTIAL,
      visitDate: '2026-06-30',
      reason: 'Control',
      diagnosisSummary: 'Se observa mejoría'
    });

    treatmentService.addTreatment({
      entryId: entryResult.entryId,
      name: 'Terapia Cognitiva',
      frequency: '1 vez por semana',
      startDate: '2026-06-30'
    });
  });

  afterAll(() => {
    db.db.exec(`DROP TABLE IF EXISTS entry_diagnoses;`);
    db.db.exec(`DROP TABLE IF EXISTS diagnosis;`);
    db.db.exec(`DROP TABLE IF EXISTS treatment;`);
    db.db.exec(`DROP TABLE IF EXISTS history_entry;`);
    db.db.exec(`DROP TABLE IF EXISTS patient_relations;`);
    db.db.exec(`DROP TABLE IF EXISTS patients;`);
    db.db.exec(`DROP TABLE IF EXISTS users;`);
  });

  it('debería orquestar y retornar la historia clínica completa', async () => {
    const fullHistory = await historyService.getFullHistory(testPatientId);

    // 1. Verificamos paciente
    expect(fullHistory.patient).toBeDefined();
    expect(fullHistory.patient!.firstName).toBe('Maria');

    // 2. Verificamos diagnósticos
    expect(fullHistory.diagnoses).toBeDefined();
    expect(fullHistory.diagnoses.active).toHaveLength(1);
    expect(fullHistory.diagnoses.active[0].title).toBe('TDAH');
    expect(fullHistory.diagnoses.past).toHaveLength(1);
    expect(fullHistory.diagnoses.past[0].title).toBe('Fobia Social');

    // 3. Verificamos timeline (visitas + profesional + tratamientos)
    expect(fullHistory.timeline).toHaveLength(1);
    const visit = fullHistory.timeline[0];
    
    expect(visit.reason).toBe('Control');
    expect(visit.diagnosisSummary).toBe('Se observa mejoría');
    
    // Resolución asíncrona del profesional
    expect(visit.professional).toBeDefined();
    expect(visit.professional.name).toBe('Dr. Orchestrator');

    // Inyección de tratamientos
    expect(visit.treatments).toHaveLength(1);
    expect(visit.treatments[0].name).toBe('Terapia Cognitiva');
  });
});
