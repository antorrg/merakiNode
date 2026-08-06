import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, startUp, closeDatabase } from './Configs/database.js';
import { users, patients, patient_relations, diagnosis, history_entry, treatment, sessions, appointments } from './Schema/schema.js';

import authIndex from './Features/auth/auth.index.js';
import userIndex from './Features/user/user.index.js';
import patientIndex from './Features/patients/patient.index.js';
import diagnosisIndex from './Features/diagnosis/diagnosis.index.js';
import historyEntryIndex from './Features/history/historyEntry.index.js';
import treatmentIndex from './Features/treatment/treatment.index.js';
import historyIndex from './Features/history/history.index.js';
import appointmentIndex from './Features/appointments/appointment.index.js';
import { DiagnosisStatus } from './Features/diagnosis/Diagnosis.js';
import { AppointmentStatus } from './Features/appointments/Appointment.js';

describe('Server End-to-End & Integration Suite (e2e.server)', () => {
  beforeAll(async () => {
    await startUp(true);
    // Inicializar esquemas de tablas
    db.db.exec(users.sql);
    db.db.exec(sessions.sql);
    db.db.exec(patients.sql);
    db.db.exec(patient_relations.sql);
    db.db.exec(diagnosis.sql);
    db.db.exec(history_entry.sql);
    db.db.exec(treatment.sql);
    db.db.exec(appointments.sql);

    // Limpieza inicial
    db.db.exec('DELETE FROM appointments;');
    db.db.exec('DELETE FROM treatment;');
    db.db.exec('DELETE FROM history_entry;');
    db.db.exec('DELETE FROM diagnosis;');
    db.db.exec('DELETE FROM patient_relations;');
    db.db.exec('DELETE FROM patients;');
    db.db.exec('DELETE FROM sessions;');
    db.db.exec('DELETE FROM users;');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // =========================================================================
  // 1. Módulo Auth
  // =========================================================================
  describe('1. Módulo Auth', () => {
    it('debería verificar que inicialmente no existen usuarios en el sistema', async () => {
      const hasUsers = await authIndex.checkUsers();
      expect(hasUsers).toBe(false);
    });

    it('debería registrar el propietario inicial (PROPIETARIO)', async () => {
      const owner = await authIndex.createInitialOwner({
        email: 'owner@meraki.com',
        username: 'PropietarioMeraki'
      });

      expect(owner).toBeDefined();
      expect(owner.userEmail).toBe('owner@meraki.com');
      expect(owner.role).toBe('PROPIETARIO');

      const hasUsersAfter = await authIndex.checkUsers();
      expect(hasUsersAfter).toBe(true);
    });
  });

  // =========================================================================
  // 2. Módulo User (CRUD & Roles)
  // =========================================================================
  describe('2. Módulo User', () => {
    let createdUserId: string;

    it('debería crear un usuario profesional', async () => {
      const newUser = await userIndex.createUser({
        userEmail: 'vet.juan@meraki.com',
        userName: 'DrJuanPerez',
        password: 'password123',
        role: 'PROFESIONAL'
      });

      expect(newUser).toBeDefined();
      expect(newUser.userId).toBeDefined();
      expect(newUser.userEmail).toBe('vet.juan@meraki.com');
      expect(newUser.role).toBe('PROFESIONAL');

      createdUserId = newUser.userId;
    });

    it('debería obtener la lista de usuarios y buscar por ID', async () => {
      const allUsers = await userIndex.getUsers();
      expect(allUsers.length).toBeGreaterThanOrEqual(2);

      const found = await userIndex.getUserById({ userId: createdUserId });
      expect(found).toBeDefined();
      expect(found.userId).toBe(createdUserId);
      expect(found.userName).toBe('DrJuanPerez');
    });

    it('debería actualizar el perfil del usuario', async () => {
      const updated = await userIndex.updateUserProfile({
        userId: createdUserId,
        email: 'vet.juan.actualizado@meraki.com',
        name: 'DrJuanPerezUpdated',
        nickname: 'JuanVete'
      });

      expect(updated.userEmail).toBe('vet.juan.actualizado@meraki.com');
      expect(updated.userName).toBe('DrJuanPerezUpdated');
      expect(updated.nickname).toBe('JuanVete');
    });

    it('debería cambiar la contraseña y verificar autenticación', async () => {
      await userIndex.updatePasswordUser({
        userId: createdUserId,
        password: 'password123',
        newPassword: 'newPassword456'
      });

      // Login con contraseña anterior debe fallar
      await expect(
        authIndex.login({
          email: 'vet.juan.actualizado@meraki.com',
          password: 'password123'
        })
      ).rejects.toThrow();

      // Login con nueva contraseña debe funcionar
      const loginRes = await authIndex.login({
        email: 'vet.juan.actualizado@meraki.com',
        password: 'newPassword456'
      });

      expect(loginRes).toBeDefined();
      expect(loginRes.user.userEmail).toBe('vet.juan.actualizado@meraki.com');
    });

    it('debería eliminar lógicamente a un usuario (soft delete)', async () => {
      const userToDelete = await userIndex.createUser({
        userEmail: 'temp.user@meraki.com',
        userName: 'UserTemp',
        password: 'password123',
        role: 'SECRETARIO'
      });

      await userIndex.deleteUser(userToDelete.userId);
      await expect(userIndex.getUserById({ userId: userToDelete.userId })).rejects.toThrow();
    });
  });

  // =========================================================================
  // 3. Módulo Patients
  // =========================================================================
  describe('3. Módulo Patients', () => {
    let patientId: string;

    it('debería registrar un nuevo paciente adulto', async () => {
      const patient = patientIndex.registerPatient({
        email: 'paciente.e2e@test.com',
        firstName: 'Roberto',
        lastName: 'Gomez',
        typeDoc: 'DNI',
        identityCode: '77889900',
        birthDate: '01/01/1990',
        phone: '1144556677',
        address: 'Av. Corrientes 1000',
        city: 'Buenos Aires',
        obraSocial: 'OSDE',
        escolaridad: 'Secundaria'
      });

      expect(patient).toBeDefined();
      expect(patient.patientId).toBeDefined();
      expect(patient.firstName).toBe('Roberto');

      patientId = patient.patientId;
    });

    it('debería obtener el paciente por ID y actualizar datos de contacto', async () => {
      const fetched = patientIndex.getPatientById({ patientId });
      expect(fetched.firstName).toBe('Roberto');

      const updated = patientIndex.updateContactData({
        patientId,
        phone: '9999999999',
        address: 'Nueva Av. Corrientes 2000'
      });

      expect(updated.phone).toBe('9999999999');
      expect(updated.address).toBe('Nueva Av. Corrientes 2000');
    });
  });

  // =========================================================================
  // 4. Módulo Diagnosis
  // =========================================================================
  describe('4. Módulo Diagnosis', () => {
    let patientId: string;
    let diagnosisId: string;

    beforeAll(() => {
      const p = patientIndex.registerPatient({
        email: 'diag.patient@test.com',
        firstName: 'Felipe',
        lastName: 'Torres',
        typeDoc: 'DNI',
        identityCode: '88776655',
        birthDate: '15/05/1992',
        phone: '1122334455',
        address: 'Calle 10',
        city: 'La Plata',
        obraSocial: 'OSDE',
        escolaridad: 'Secundaria'
      });
      patientId = p.patientId;
    });

    it('debería registrar un diagnóstico activo y consultarlo', async () => {
      const diag = diagnosisIndex.addDiagnosisToPatient({
        patientId,
        title: 'Gastritis Crónica',
        description: 'Dolor estomacal recurrente',
        startDate: '2026-07-01',
        status: DiagnosisStatus.ACTIVE
      });

      expect(diag).toBeDefined();
      expect(diag.title).toBe('Gastritis Crónica');

      diagnosisId = diag.diagnosisId;

      const activeList = diagnosisIndex.getActiveDiagnoses({ patientId });
      expect(activeList.length).toBe(1);
      expect(activeList[0].title).toBe('Gastritis Crónica');
    });

    it('debería resolver el diagnóstico (ACTIVE -> RESOLVED)', async () => {
      const updated = diagnosisIndex.updateDiagnosis({
        diagnosisId,
        status: DiagnosisStatus.RESOLVED,
        endDate: '2026-07-31'
      });

      expect(updated.status).toBe(DiagnosisStatus.RESOLVED);

      const activeList = diagnosisIndex.getActiveDiagnoses({ patientId });
      expect(activeList.length).toBe(0);
    });
  });

  // =========================================================================
  // 5. Módulo Treatment
  // =========================================================================
  describe('5. Módulo Treatment', () => {
    let patientId: string;
    let professionalId: string;
    let entryId: string;

    beforeAll(async () => {
      const prof = await userIndex.createUser({
        userEmail: 'vet.treat@meraki.com',
        userName: 'DrTratamiento',
        password: 'password123',
        role: 'PROFESIONAL'
      });
      professionalId = prof.userId;

      const patient = patientIndex.registerPatient({
        email: 'treat.patient@test.com',
        firstName: 'Milo',
        lastName: 'Diaz',
        typeDoc: 'DNI',
        identityCode: '33221100',
        birthDate: '20/10/1995',
        phone: '1133557799',
        address: 'Calle 5',
        city: 'Cordoba',
        obraSocial: 'OSDE',
        escolaridad: 'Secundaria'
      });
      patientId = patient.patientId;

      const entry = historyEntryIndex.addEntry({
        patientId,
        professionalId,
        visitDate: '2026-07-31',
        visitType: 'CONSULTATION',
        reason: 'Revisión anual'
      });
      entryId = entry.entryId;
    });

    it('debería registrar y consultar un tratamiento', async () => {
      const treat = treatmentIndex.addTreatment({
        entryId,
        name: 'Omeprazol 20mg',
        frequency: 'Cada 24hs',
        startDate: '2026-07-31'
      });

      expect(treat).toBeDefined();
      expect(treat.name).toBe('Omeprazol 20mg');

      const list = treatmentIndex.getTreatmentsByPatient({ patientId });
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Omeprazol 20mg');
    });
  });

  // =========================================================================
  // 6. Flujo Integral de Historia Clínica (history:getFull)
  // =========================================================================
  describe('6. Flujo Integral de Historia Clínica (history:getFull)', () => {
    it('debería consolidar el expediente clínico completo del paciente con múltiples profesionales', async () => {
      // 1. Crear profesionales Alpha y Beta
      const drAlpha = await userIndex.createUser({
        userEmail: 'alpha.e2e@meraki.com',
        userName: 'DrAlphaE2E',
        password: 'password123',
        role: 'PROFESIONAL'
      });

      const drBeta = await userIndex.createUser({
        userEmail: 'beta.e2e@meraki.com',
        userName: 'DrBetaE2E',
        password: 'password123',
        role: 'PROFESIONAL'
      });

      // 2. Registrar Paciente
      const patient = patientIndex.registerPatient({
        email: 'e2e.full@test.com',
        firstName: 'Max',
        lastName: 'Power',
        typeDoc: 'DNI',
        identityCode: '11229988',
        birthDate: '01/01/1990',
        phone: '1155990011',
        address: 'Av. Siempreviva 742',
        city: 'Springfield',
        obraSocial: 'OSDE',
        escolaridad: 'Secundaria'
      });

      // 3. Diagnóstico
      diagnosisIndex.addDiagnosisToPatient({
        patientId: patient.patientId,
        title: 'Otitis Bilateral',
        startDate: '2026-07-15',
        status: DiagnosisStatus.ACTIVE
      });

      // 4. Evolución de Dr Alpha con Tratamiento
      const entryAlpha = historyEntryIndex.addEntry({
        patientId: patient.patientId,
        professionalId: drAlpha.userId,
        visitDate: '2026-07-15',
        visitType: 'CONSULTATION',
        reason: 'Dolor de oídos'
      });

      treatmentIndex.addTreatment({
        entryId: entryAlpha.entryId,
        name: 'Gotas Oticas',
        frequency: 'Cada 12hs',
        startDate: '2026-07-15'
      });

      // 5. Evolución de Dr Beta
      const entryBeta = historyEntryIndex.addEntry({
        patientId: patient.patientId,
        professionalId: drBeta.userId,
        visitDate: '2026-07-22',
        visitType: 'CONTROL',
        reason: 'Control de otitis'
      });

      // 6. Probar filtro por profesional vs filtro total
      const alphaOnly = historyEntryIndex.getPatientEntries({
        patientId: patient.patientId,
        professionalId: drAlpha.userId
      });
      expect(alphaOnly.length).toBe(1);
      expect(alphaOnly[0].entryId).toBe(entryAlpha.entryId);

      const allEntries = historyEntryIndex.getPatientEntries({
        patientId: patient.patientId
      });
      expect(allEntries.length).toBe(2);

      // 7. getFullHistory
      const fullHistory = await historyIndex.getFullHistory({ patientId: patient.patientId });

      expect(fullHistory).toBeDefined();
      expect(fullHistory.patient.firstName).toBe('Max');
      expect(fullHistory.diagnoses.active.length).toBe(1);
      expect(fullHistory.diagnoses.active[0].title).toBe('Otitis Bilateral');
      expect(fullHistory.timeline.length).toBe(2);

      const timelineAlpha = fullHistory.timeline.find((t: any) => t.entryId === entryAlpha.entryId);
      expect(timelineAlpha).toBeDefined();
      expect(timelineAlpha!.professional.name).toBe('DrAlphaE2E');
      expect(timelineAlpha!.treatments[0].name).toBe('Gotas Oticas');

      const timelineBeta = fullHistory.timeline.find((t: any) => t.entryId === entryBeta.entryId);
      expect(timelineBeta).toBeDefined();
      expect(timelineBeta!.professional.name).toBe('DrBetaE2E');
    });
  });

  // =========================================================================
  // 7. Módulo Appointments (Gestión de Turnos)
  // =========================================================================
  describe('7. Módulo Appointments (Gestión de Turnos)', () => {
    let patientId: string;
    let professionalId: string;
    let appointmentId: string;

    beforeAll(async () => {
      const prof = await userIndex.createUser({
        userEmail: 'dr.turno@meraki.com',
        userName: 'DrTurnos',
        password: 'password123',
        role: 'PROFESIONAL'
      });
      professionalId = prof.userId;

      const p = patientIndex.registerPatient({
        email: 'paciente.turno@test.com',
        firstName: 'Lucas',
        lastName: 'Martinez',
        typeDoc: 'DNI',
        identityCode: '44556677',
        birthDate: '12/12/1993',
        phone: '1122446688',
        address: 'Calle Turno 100',
        city: 'Mendoza',
        obraSocial: 'OSDE',
        escolaridad: 'Secundaria'
      });
      patientId = p.patientId;
    });

    it('debería agendar un nuevo turno correctamente (createAppointment)', async () => {
      const newApp = appointmentIndex.createAppointment({
        patientId,
        professionalId,
        service: 'Consulta de Control',
        startTime: '2026-08-01T09:00:00.000Z',
        endTime: '2026-08-01T09:30:00.000Z',
        notes: 'Paciente requiere confirmación telefónica',
        createdBy: professionalId
      });

      expect(newApp).toBeDefined();
      expect(newApp.appointmentId).toBeDefined();
      expect(newApp.status).toBe(AppointmentStatus.CONFIRMED);
      expect(newApp.service).toBe('Consulta de Control');

      appointmentId = newApp.appointmentId;
    });

    it('debería rechazar un turno que se solape con el mismo profesional en el mismo horario', async () => {
      expect(() => {
        appointmentIndex.createAppointment({
          patientId,
          professionalId,
          service: 'Consulta Solapada',
          startTime: '2026-08-01T09:15:00.000Z',
          endTime: '2026-08-01T09:45:00.000Z',
          createdBy: professionalId
        });
      }).toThrow();
    });

    it('debería consultar turnos por rango de fechas (getAppointmentsByRange)', async () => {
      const list = appointmentIndex.getAppointmentsByRange({
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-08-01T23:59:59.000Z',
        professionalId
      });

      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(1);
      expect(list[0].patientName).toBe('Lucas Martinez');
      expect(list[0].professionalName).toBe('DrTurnos');
    });

    it('debería cancelar un turno y conservar el registro en la DB (updateAppointmentStatus a CANCELLED)', async () => {
      const updated = appointmentIndex.updateAppointmentStatus({
        appointmentId,
        status: AppointmentStatus.CANCELLED,
        notes: 'Cancelado por el paciente con aviso previo'
      });

      expect(updated).toBeDefined();
      expect(updated.status).toBe(AppointmentStatus.CANCELLED);

      // El turno debe seguir figurando en el historial del paciente
      const patientApps = appointmentIndex.getAppointmentsByPatient({ patientId });
      expect(patientApps.length).toBe(1);
      expect(patientApps[0].status).toBe(AppointmentStatus.CANCELLED);
    });
  });
});
