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
  static typeDoc(prop: string) {
    const validTypes = ['DNI', 'PASSPORT', 'LIBRETA_CIVICA']
    if(!validTypes.includes(prop.toUpperCase())){
      throw new Error('Invalid typeDoc')
    }
    return prop.toUpperCase()
  }
  static identityCode(prop: string) {
    const regexIdentityCode = /^[0-9]{8}$/
    if(typeof(prop) !== 'string'|| !regexIdentityCode.test(prop)){
      throw new Error('Invalid identityCode')
    }
    return prop
  }
  static birthDate(prop: string) {
    const regexBirthDate = /^\d{2}\/\d{2}\/\d{4}$/
    if(typeof(prop) !== 'string'|| !regexBirthDate.test(prop)){
      throw new Error('Invalid birthDate')
    }
    return prop
  }
  static age(prop: number) {
    if(typeof(prop) !== 'number' || prop < 0 || prop > 130){
      throw new Error('Invalid age')
    }
    return prop
  }
}