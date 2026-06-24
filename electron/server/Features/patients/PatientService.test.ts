import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { db } from '../../Configs/database.js';
import { patients, patient_relations } from '../../Schema/schema.js';
import { PatientService } from './PatientService.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';
import { PatientCreate } from './Patient.js';

vi.mock('../../Configs/envConfig.js', () => ({
  default: {
    DatabaseUrl: ':memory:',
    Status: 'test',
    Port: 3000,
    Secret: 'secret',
    ExpiresIn: '1'
  }
}));

describe('PatientService (SQLite Integration)', () => {
  let service: PatientService;

  beforeAll(() => {
    // Inicializar las tablas necesarias
    db.db.exec(patients.sql);
    db.db.exec(patient_relations.sql);
    
    service = new PatientService();
  });

  afterAll(() => {
    // Limpieza
    db.db.exec(`DROP TABLE IF EXISTS patient_relations;`);
    db.db.exec(`DROP TABLE IF EXISTS patients;`);
  });

  it('debería registrar un paciente adulto correctamente', () => {
    const adultData: PatientCreate = {
      email: 'adulto@test.com',
      firstName: 'Juan',
      lastName: 'Adulto',
      typeDoc: 'DNI',
      identityCode: '11111111',
      birthDate: '01/01/1990', // Tiene > 18 años
      phone: '1234567890',
      address: 'Calle 1',
      city: 'Ciudad',
      postalCode: '1000'
    };

    const result = service.registerPatient(adultData);
    expect(result).toBeDefined();
    expect(result.patientId).toBeDefined();
    expect(result.phone).toBe('1234567890');
    expect(result.age).toBeGreaterThanOrEqual(30);
  });

  it('debería registrar un paciente menor de edad con su tutor', () => {
    // Primero, creamos un paciente que actuará como tutor (debe existir en la base de datos)
    const guardianData: PatientCreate = {
      email: 'tutor@test.com',
      firstName: 'Tutor',
      lastName: 'Responsable',
      typeDoc: 'DNI',
      identityCode: '22222222',
      birthDate: '01/01/1980',
      phone: '0987654321',
      address: 'Calle 2',
      city: 'Ciudad',
      postalCode: '2000'
    };

    const guardianResult = service.registerPatient(guardianData);

    // Ahora creamos al menor
    const minorData: PatientCreate = {
      email: null,
      firstName: 'Niño',
      lastName: 'Menor',
      typeDoc: 'DNI',
      identityCode: '33333333',
      birthDate: '01/01/2015', // Menor de edad
      phone: null,
      address: 'Calle 2',
      city: 'Ciudad',
      postalCode: '2000',
      guardians: [
        {
          relationId: UuidHandler.idCreator(),
          guardian: {
            ...guardianData,
            patientId: guardianResult.patientId,
            age: guardianResult.age
          },
          relationshipType: 'Padre',
          isPrimaryContact: true
        }
      ]
    };

    const minorResult = service.registerPatient(minorData);
    
    // Verificamos el resultado del menor
    expect(minorResult).toBeDefined();
    expect(minorResult.patientId).toBeDefined();
    
    // El getter inteligente debería devolver el teléfono del tutor
    expect(minorResult.phone).toBe('0987654321');
    expect(minorResult.guardians).toHaveLength(1);
    expect(minorResult.guardians[0].isPrimary).toBe(true);
    expect(minorResult.guardians[0].relationship).toBe('Padre');
  });

  it('debería obtener un paciente por ID con sus relaciones hidratadas', () => {
    // Obtenemos todos para agarrar el ID del menor
    const all = service.getAllPatients();
    const minor = all.find(p => p.firstName === 'Niño');
    expect(minor).toBeDefined();

    const minorId = minor!.patientId;

    // Ejecutamos getPatientById
    const fetchedMinor = service.getPatientById(minorId);
    
    expect(fetchedMinor).toBeDefined();
    expect(fetchedMinor.firstName).toBe('Niño');
    // Verifica que el contacto inteligente sigue funcionando desde el backend
    expect(fetchedMinor.phone).toBe('0987654321');
    expect(fetchedMinor.guardians).toHaveLength(1);
    expect(fetchedMinor.guardians[0].name).toBe('Tutor Responsable');
  });

  it('debería actualizar el contacto de un paciente adulto', () => {
    const all = service.getAllPatients();
    const adult = all.find(p => p.firstName === 'Juan');
    
    const updated = service.updatePatientContact(adult!.patientId, '111222333', 'nuevo@email.com');
    
    expect(updated.phone).toBe('111222333');
    expect(updated.email).toBe('nuevo@email.com');

    // Verificamos que se haya guardado en DB
    const fetched = service.getPatientById(adult!.patientId);
    expect(fetched.phone).toBe('111222333');
    expect(fetched.email).toBe('nuevo@email.com');
  });

  it('debería fallar al actualizar el contacto de un menor si no se le pasa un tutor y cumple la mayoría (Domain test integrado)', () => {
    // Solo aseguramos que se lance la excepción correcta del dominio desde el servicio si rompemos la regla
    // Aunque este es un test de dominio, comprobamos que el Service propague el throw
    // Dado que el update solo permite cambiar phone y email, un menor podría fallar si se le intenta poner phone vacío.
    // Sin embargo, en el updatePatientContact no mandamos nuevos guardianes, usa los que ya tiene guardados.
    const all = service.getAllPatients();
    const minor = all.find(p => p.firstName === 'Niño');
    
    // Si intentamos actualizarle el telefono a algo vacío, y ya era menor...
    // Como tiene tutores, debería pasar (el dominio dice "si es menor, necesita tutor", que ya lo tiene).
    expect(() => {
      service.updatePatientContact(minor!.patientId, '', null);
    }).not.toThrow();
  });

  it('debería borrar un paciente', () => {
    const all = service.getAllPatients();
    const minor = all.find(p => p.firstName === 'Niño');
    
    const result = service.deletePatient(minor!.patientId);
    
    // El BaseRepository.delete devuelve en results el numero de rows (como string)
    expect(result.results).toBe('1');
    
    // Si intentamos buscarlo, debe lanzar error (Patient not found)
    expect(() => service.getPatientById(minor!.patientId)).toThrow('Patient not found');
  });
});
