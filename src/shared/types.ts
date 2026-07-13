
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  PROPIETARIO = "PROPIETARIO",
}
export interface IUser {
    userId:string
    userEmail:string
    userName:string
    nickname:string
    role: Role
    enabled:boolean
    createdAt:string
    updatedAt:string
}
export interface IPatient {
    patientId:string
    firstName:string
    lastName:string
    typeDoc:string
    identityCode:string
    birthDate: string
    age: number
    address: string
    city: string
}
