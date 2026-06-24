import { UuidHandler } from "../../Shared/Utils/UuidHandler.js";
import { PatientApplications } from "./applications/PatientApplications.js";

// Interfaz para la relación N:M
export interface GuardianRelation {
  relationId: string;
  guardian: PatientProps; 
  relationshipType: string;
  isPrimaryContact: boolean;
}

export interface PatientProps {
  patientId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  typeDoc: string;
  identityCode: string;
  birthDate: string;   
  age: number; 
  phone: string | null;
  address: string;
  city: string;
  postalCode: string;
  deletedAt?: string | null;
  guardians?: GuardianRelation[];
}

export type PatientCreate = Omit<PatientProps, 'patientId' | 'deletedAt' | 'age'>;

export class Patient {
  protected readonly patientId: string;
  protected email: string | null;
  protected firstName: string;
  protected lastName: string;
  protected typeDoc: string;
  protected identityCode: string;
  protected birthDate: string;  
  protected age: number; 
  protected phone: string | null;
  protected address: string;
  protected city: string;
  protected postalCode: string;
  protected guardians: GuardianRelation[];

  constructor(props: PatientProps) {
    this.patientId = PatientApplications.Id(props.patientId);
    this.email = PatientApplications.Email(props.email);
    this.firstName = Patient.validateName(props.firstName);
    this.lastName = Patient.validateName(props.lastName);
    this.typeDoc = props.typeDoc;
    this.identityCode = props.identityCode;
    this.birthDate = props.birthDate;
    // Calculamos la edad dinámicamente siempre (para detectar si el paciente creció)
    this.age = Patient.calculateAge(props.birthDate);
    this.phone = PatientApplications.Phone(props.phone);
    this.address = props.address;
    this.city = props.city;
    this.postalCode = props.postalCode;
    this.guardians = props.guardians || []; 
  }

  static validateName(prop: string): string {
    if(!prop || typeof prop !== 'string' || prop.trim().length < 2) throw new Error('Invalid name')
    return prop.trim()
  }

  static register(props: PatientCreate): Patient {
    const currentAge = Patient.calculateAge(props.birthDate);
    Patient.validateAgeRequirements(currentAge, props.phone, props.guardians || []);

    return new Patient({
        patientId: UuidHandler.idCreator(),
        ...props,
        age: currentAge,
        guardians: props.guardians || []
    });
  }

  static calculateAge(birthDateStr: string): number {
    const [day, month, year] = birthDateStr.split('/').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = (today.getMonth() + 1) - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  }

  static validateAgeRequirements(age: number, phone: string | null | undefined, guardians: GuardianRelation[]) {
    if (age < 18) {
      if (!guardians || guardians.length === 0) {
        throw new Error('Un paciente menor de edad debe tener al menos un tutor asignado.');
      }
      const hasPrimary = guardians.some(g => g.isPrimaryContact);
      if (!hasPrimary) {
        throw new Error('Un paciente menor de edad debe tener al menos un tutor marcado como contacto principal.');
      }
    } else {
      if (!phone || phone.trim() === '') {
        throw new Error('Un paciente mayor de edad debe tener su propio teléfono de contacto.');
      }
    }
  }

  updateContactData(phone: string, email: string | null) {
    const currentAge = Patient.calculateAge(this.birthDate);
    Patient.validateAgeRequirements(currentAge, phone, this.guardians);
    
    this.phone = PatientApplications.Phone(phone);
    this.email = email ? PatientApplications.Email(email) : null;
    this.age = currentAge;
  }

  // GETTERS INTELIGENTES para contacto
  get contactPhone(): string | null {
    if (this.phone) return this.phone;
    if (this.guardians.length > 0) {
        const primary = this.guardians.find(g => g.isPrimaryContact);
        if (primary && primary.guardian.phone) return primary.guardian.phone;
        return this.guardians[0].guardian.phone || null;
    }
    return null;
  }

  get contactEmail(): string | null {
    if (this.email) return this.email;
    if (this.guardians.length > 0) {
        const primary = this.guardians.find(g => g.isPrimaryContact);
        if (primary && primary.guardian.email) return primary.guardian.email;
        return this.guardians[0].guardian.email || null;
    }
    return null;
  }

  // Mapeos para Infraestructura (DB)
  toPersistence() {
    return {
      patient_id: this.patientId,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      type_doc: this.typeDoc,
      identity_code: this.identityCode,
      birth_date: this.birthDate,
      age: this.age,
      phone: this.phone,
      address: this.address,
      city: this.city,
      postal_code: this.postalCode
    }
  }

  // Mapeos para el Cliente (Respuesta JSON)
  toDTO() {
    return {
      patientId: this.patientId,
      firstName: this.firstName,
      lastName: this.lastName,
      typeDoc: this.typeDoc,
      identityCode: this.identityCode,
      birthDate: this.birthDate,
      age: this.age,
      address: this.address,
      city: this.city,
      
      // Enviamos el contacto "inteligente" (si no tiene propio, envía el del padre)
      phone: this.contactPhone, 
      email: this.contactEmail, 
      
      // Enviamos info resumida de los tutores por si el Frontend quiere mostrarlos
      guardians: this.guardians.map(g => ({
        relationship: g.relationshipType,
        isPrimary: g.isPrimaryContact,
        name: `${g.guardian.firstName} ${g.guardian.lastName}`,
        phone: g.guardian.phone
      }))
    }
  }
}