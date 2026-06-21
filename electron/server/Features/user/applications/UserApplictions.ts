import { UuidHandler } from '../../../Shared/Utils/UuidHandler.js'

export class UserApplications{
  static Id(prop:string){
    if(!prop || typeof(prop) !== 'string'|| !UuidHandler.idValidator(prop)){
      throw new Error('Invalid userId format')
    }
    return prop
  }

  static Email(prop:string){
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!prop || typeof(prop) !== 'string'|| !regexEmail.test(prop)){
      throw new Error('Invalid email format')
    }
    return prop.toLowerCase()
  }
  static Role(prop:string){
    if(!prop || typeof(prop) !== 'string') throw new Error('Missing or invalid role')
    const role = prop.trim().toUpperCase()
     const allowed = ['PROPIETARIO', 'ADMIN', 'USER']
     if(!allowed.includes(role)){
      throw new Error('Invalid role')
    }
    return role
  }
}

