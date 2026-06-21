import { UuidHandler } from '../../../Shared/Utils/UuidHandler.js'

export class PatientApplications {
  static Id(prop: string) {
    if(!prop || typeof(prop) !== 'string'|| !UuidHandler.idValidator(prop)){
      throw new Error('Invalid patientId format')
    }
    return prop
  }

  static Email(prop?: string | null) {
    if (!prop) return null; // Permite nulos para menores de edad
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(typeof(prop) !== 'string'|| !regexEmail.test(prop)){
      throw new Error('Invalid email format')
    }
    return prop.toLowerCase()
  }

  static Phone(prop?: string | null) {
    if (!prop) return null; // Permite nulos
    // Aquí puedes meter un regex si quieres validar el teléfono
    return prop.trim();
  }
}