import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db, startUp, closeDatabase } from '../../Configs/database.js';
import patientIndex from './patient.index.js';

describe('patient.index integration tests', () => {
  beforeAll(async () => {
    await startUp(true);
  });

  beforeEach(() => {
    db.db.exec('PRAGMA foreign_keys = OFF;');
    db.db.exec('DELETE FROM patient_relations;');
    db.db.exec('DELETE FROM patients;');
    db.db.exec('PRAGMA foreign_keys = ON;');
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('debería registrar un paciente adulto a través del punto de entrada patientIndex', async () => {
    const adultData = {
      email: 'juan.perez@test.com',
      firstName: 'Juan',
      lastName: 'Perez',
      typeDoc: 'DNI',
      identityCode: '12345678',
      birthDate: '01/01/1990',
      phone: '1122334455',
      address: 'Av. Siempre Viva 123',
      city: 'Springfield',
      obraSocial: 'OSDE',
      escolaridad: 'Secundaria'
    };

    const registered = patientIndex.registerPatient(adultData);
    expect(registered).toBeDefined();
    expect(registered.patientId).toBeDefined();
    expect(registered.firstName).toBe('Juan');
    expect(registered.lastName).toBe('Perez');
  });

  it('debería obtener el listado paginado de pacientes registrados', async () => {
    const adultData = {
      email: 'maria.gomez@test.com',
      firstName: 'Maria',
      lastName: 'Gomez',
      typeDoc: 'DNI',
      identityCode: '87654321',
      birthDate: '15/05/1992',
      phone: '9988776655',
      address: 'Calle Falsa 123',
      city: 'Cordoba',
      obraSocial: 'Swiss Medical',
      escolaridad: 'Universitario'
    };

    patientIndex.registerPatient(adultData);

    const result = patientIndex.getPatients({});
    expect(result).toBeDefined();
    expect(result.info).toBeDefined();
    expect(result.info.totalItems).toBe(1);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].firstName).toBe('Maria');
  });

  it('debería obtener un paciente por su ID (getPatientById)', async () => {
    const created = patientIndex.registerPatient({
      email: 'carlos@test.com',
      firstName: 'Carlos',
      lastName: 'Lopez',
      typeDoc: 'DNI',
      identityCode: '33445566',
      birthDate: '10/10/1985',
      phone: '5544332211',
      address: 'Calle 1',
      city: 'Mendoza',
      postalCode: '5500'
    });

    const patient = patientIndex.getPatientById({ patientId: created.patientId });
    expect(patient).toBeDefined();
    expect(patient.patientId).toBe(created.patientId);
    expect(patient.firstName).toBe('Carlos');
  });

  it('debería actualizar los datos de contacto de un paciente (updateContactData)', async () => {
    const created = patientIndex.registerPatient({
      email: 'ana@test.com',
      firstName: 'Ana',
      lastName: 'Martinez',
      typeDoc: 'DNI',
      identityCode: '44556677',
      birthDate: '20/02/1995',
      phone: '1111111111',
      address: 'Calle 2',
      city: 'Rosario',
      postalCode: '2000'
    });

    const updated = patientIndex.updateContactData({
      ...created,
      patientId: created.patientId,
      phone: '9999999999',
      address: 'Nueva Calle 456'
    });

    expect(updated).toBeDefined();

    const fetched = patientIndex.getPatientById({ patientId: created.patientId });
    expect(fetched.phone).toBe('9999999999');
    expect(fetched.address).toBe('Nueva Calle 456');
  });

  it('debería eliminar un paciente correctamente (deletePatient)', async () => {
    const created = patientIndex.registerPatient({
      email: 'borrar@test.com',
      firstName: 'Pedro',
      lastName: 'Borrar',
      typeDoc: 'DNI',
      identityCode: '99001122',
      birthDate: '05/05/1990',
      phone: '2233445566',
      address: 'Calle 3',
      city: 'Salta',
      postalCode: '4400'
    });

    const deleteResponse = patientIndex.deletePatient({ patientId: created.patientId });
    expect(deleteResponse).toBeDefined();

    const listAfterDelete = patientIndex.getPatients({});
    expect(listAfterDelete.info.totalItems).toBe(0);
    expect(listAfterDelete.data.length).toBe(0);
  });

  it('debería fallar al solicitar getPatientById con un UUID inválido', async () => {
    expect(() => {
      patientIndex.getPatientById({ patientId: 'not-a-valid-uuid' });
    }).toThrow();
  });
});
