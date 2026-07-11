import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { patients, users, history_entry } from '../../Schema/schema.js';
import { HistoryEntryService } from './HistoryEntryService.js';
import { HistoryEntryRepository } from './HistoryEntryRepository.js';
import { VisitType } from './HistoryEntry.js';
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

describe('HistoryEntryService (SQLite Integration)', () => {
  let entryService: HistoryEntryService;
  let patientService: PatientService;
  let userService: UserService;
  let testPatientId: string;
  let testProfessionalId: string;

  beforeAll(async () => {
    db.db.exec(users.sql);
    db.db.exec(patients.sql);
    db.db.exec(history_entry.sql);
    
    entryService = new HistoryEntryService(new HistoryEntryRepository());
    patientService = new PatientService();
    userService = new UserService(new UserRepository());

    // Crear profesional
    const proData = {
      userEmail: 'dr@test.com',
      password: '123',
      role: 'ADMIN'
    };
    const userResult = await userService.createUser(proData);
    testProfessionalId = userResult.userId;

    // Crear paciente
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
    db.db.exec(`DROP TABLE IF EXISTS history_entry;`);
    db.db.exec(`DROP TABLE IF EXISTS patients;`);
    db.db.exec(`DROP TABLE IF EXISTS users;`);
  });

  it('debería registrar una evolución', () => {
    const result = entryService.addEntry({
      patientId: testPatientId,
      professionalId: testProfessionalId,
      visitType: VisitType.PRESENTIAL,
      visitDate: '2026-06-30',
      reason: 'Control anual',
      observations: 'Paciente estable'
    });

    expect(result).toBeDefined();
    expect(result.entryId).toBeDefined();
    expect(result.reason).toBe('Control anual');
    expect(result.visitType).toBe(VisitType.PRESENTIAL);
  });

  it('debería recuperar las evoluciones del paciente', () => {
    const list = entryService.getPatientEntries(testPatientId);
    expect(list).toHaveLength(1);
    expect(list[0].professionalId).toBe(testProfessionalId);
  });
});
