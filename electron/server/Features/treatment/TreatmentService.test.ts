import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { patients, users, history_entry, treatment } from '../../Schema/schema.js';
import { TreatmentService } from './TreatmentService.js';
import { TreatmentRepository } from './TreatmentRepository.js';
import { HistoryEntryService } from '../history/HistoryEntryService.js';
import { HistoryEntryRepository } from '../history/HistoryEntryRepository.js';
import { VisitType } from '../history/HistoryEntry.js';
import { PatientService } from '../patients/PatientService.js';
import { UserService } from '../user/UserService.js';
import { UserRepository } from '../user/UserRepository.js';

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}));

describe('TreatmentService (SQLite Integration)', () => {
  let treatmentService: TreatmentService;
  let entryService: HistoryEntryService;
  let patientService: PatientService;
  let userService: UserService;
  
  let testEntryId: string;

  beforeAll(async () => {
    db.db.exec(users.sql);
    db.db.exec(patients.sql);
    db.db.exec(history_entry.sql);
    db.db.exec(treatment.sql);
    
    treatmentService = new TreatmentService(new TreatmentRepository());
    entryService = new HistoryEntryService(new HistoryEntryRepository());
    patientService = new PatientService();
    userService = new UserService(new UserRepository());

    // Setup: User -> Patient -> Entry -> Treatment
    const userResult = await userService.createUser({
      userEmail: 'dr_treat@test.com',
      userName:'Dr. Orchestrator',
      password: '123',
      role: 'ADMIN'
    });
    
    const patientResult = patientService.registerPatient({
      email: 'p_treat@test.com',
      firstName: 'Juan',
      lastName: 'Perez',
      typeDoc: 'DNI',
      identityCode: '11111111',
      birthDate: '01/01/1990',
      phone: '1234567890',
      address: 'Calle 1',
      city: 'Ciudad',
      postalCode: '1000'
    });

    const entryResult = entryService.addEntry({
      patientId: patientResult.patientId,
      professionalId: userResult.userId,
      visitType: VisitType.PRESENTIAL,
      visitDate: '2026-06-30',
      reason: 'Diagnóstico'
    });
    
    testEntryId = entryResult.entryId;
  });

  afterAll(() => {
    db.db.exec(`DROP TABLE IF EXISTS treatment;`);
    db.db.exec(`DROP TABLE IF EXISTS history_entry;`);
    db.db.exec(`DROP TABLE IF EXISTS patients;`);
    db.db.exec(`DROP TABLE IF EXISTS users;`);
  });

  it('debería agregar un tratamiento a una evolución', () => {
    const result = treatmentService.addTreatment({
      entryId: testEntryId,
      name: 'Ibuprofeno',
      frequency: 'Cada 8 horas',
      startDate: '2026-06-30'
    });

    expect(result).toBeDefined();
    expect(result.treatmentId).toBeDefined();
    expect(result.name).toBe('Ibuprofeno');
    expect(result.frequency).toBe('Cada 8 horas');
  });

  it('debería recuperar los tratamientos de una evolución', () => {
    const list = treatmentService.getTreatmentsByEntry(testEntryId);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Ibuprofeno');
  });
});
