import { describe, it, expect } from 'vitest';
import { Patient, GuardianRelation } from './Patient.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

describe('Patient Domain Logic - Age Requirements', () => {
  const getBaseProps = () => ({
    patientId: UuidHandler.idCreator(),
    email: null,
    firstName: 'Juan',
    lastName: 'Perez',
    typeDoc: 'DNI',
    identityCode: '12345678',
    address: 'Calle Falsa 123',
    city: 'Springfield',
    postalCode: '1000'
  });

  const getMinorBirthDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 10);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const getAdultBirthDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 25);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const getTransitionBirthDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    // Para asegurarse de que tiene exactamente 18 (o acaba de cumplirlos hoy)
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const mockGuardian: GuardianRelation = {
    relationId: '1',
    guardian: {
        ...getBaseProps(),
        age: 40,
        birthDate: '01/01/1980',
        phone: '1122334455'
    },
    relationshipType: 'Padre',
    isPrimaryContact: true
  };

  describe('Registro de Menores de edad (< 18)', () => {
    it('Debe fallar si no tiene tutores asignados', () => {
      const props = {
        ...getBaseProps(),
        birthDate: getMinorBirthDate(),
        phone: null,
        guardians: []
      };

      expect(() => Patient.register(props)).toThrow('Un paciente menor de edad debe tener al menos un tutor asignado');
    });

    it('Debe fallar si tiene tutores pero ninguno es contacto principal', () => {
      const nonPrimaryGuardian = { ...mockGuardian, isPrimaryContact: false };
      const props = {
        ...getBaseProps(),
        birthDate: getMinorBirthDate(),
        phone: null,
        guardians: [nonPrimaryGuardian]
      };

      expect(() => Patient.register(props)).toThrow('Un paciente menor de edad debe tener al menos un tutor marcado como contacto principal');
    });

    it('Debe permitir registro si tiene un tutor principal válido', () => {
      const props = {
        ...getBaseProps(),
        birthDate: getMinorBirthDate(),
        phone: null,
        guardians: [mockGuardian]
      };

      const patient = Patient.register(props);
      expect(patient).toBeInstanceOf(Patient);
      
      // Comprobar getters inteligentes
      const dto = patient.toDTO();
      expect(dto.phone).toBe('1122334455'); // Toma el teléfono del padre
    });
  });

  describe('Registro de Mayores de edad (>= 18)', () => {
    it('Debe fallar si no provee su propio teléfono de contacto', () => {
      const props = {
        ...getBaseProps(),
        birthDate: getAdultBirthDate(),
        phone: null,
        guardians: []
      };

      expect(() => Patient.register(props)).toThrow('Un paciente mayor de edad debe tener su propio teléfono de contacto');
    });

    it('Debe permitir registro si provee su teléfono de contacto', () => {
      const props = {
        ...getBaseProps(),
        birthDate: getAdultBirthDate(),
        phone: '5544332211',
        guardians: []
      };

      const patient = Patient.register(props);
      expect(patient).toBeInstanceOf(Patient);
      
      const dto = patient.toDTO();
      expect(dto.phone).toBe('5544332211');
    });
  });

  describe('Transición: Menor que cumple la mayoría de edad', () => {
    it('Debe exigir teléfono propio al actualizar datos si cumplió 18', () => {
      // 1. Instanciamos a alguien que en DB figura como menor o acaba de cumplir 18 hoy,
      // pero en su registro original no tenía teléfono. 
      // El constructor lo permite para hidratar desde la DB sin romper.
      const patient = new Patient({
        ...getBaseProps(),
        birthDate: getTransitionBirthDate(),
        phone: null, // No tenía teléfono
        age: 18, // Aunque se recalcula internamente
        guardians: [mockGuardian]
      });

      // Validamos que su teléfono de contacto actualmente es el del padre
      expect(patient.contactPhone).toBe('1122334455');

      // 2. Intenta actualizar algo, la validación le dice "ahora eres mayor, dame tu teléfono"
      expect(() => patient.updateContactData('', null)).toThrow('Un paciente mayor de edad debe tener su propio teléfono de contacto');

      // 3. Provee su propio teléfono
      patient.updateContactData('9988776655', 'nuevo@email.com');

      // Validamos que ahora el teléfono de contacto es el suyo propio
      expect(patient.contactPhone).toBe('9988776655');
      expect(patient.contactEmail).toBe('nuevo@email.com');
    });
  });
});
