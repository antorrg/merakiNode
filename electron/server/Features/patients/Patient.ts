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
  phone: string | null;
  address: string;
  city: string;
  postalCode: string;
  deletedAt?: string | null;
  guardians?: GuardianRelation[];
}

export type PatientCreate = Omit<PatientProps, 'patientId' | 'deletedAt'>;

export class Patient {
  protected readonly patientId: string;
  protected email: string | null;
  protected firstName: string;
  protected lastName: string;
  protected typeDoc: string;
  protected identityCode: string;
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
    return new Patient({
        patientId: UuidHandler.idCreator(),
        ...props,
        guardians: props.guardians || []
    })
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