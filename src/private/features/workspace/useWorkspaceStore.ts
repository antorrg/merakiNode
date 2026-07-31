import { create } from 'zustand';
import { IPatient } from '../../../types';

export type WorkspaceSection = 'new-entry' | 'history' | 'treatments' | 'diagnostic' | 'patient' | 'pat_calendar';

export interface OpenPatient {
  patient: IPatient;
  shortName: string;
  activeSection: WorkspaceSection;
}

interface WorkspaceState {
  openPatients: OpenPatient[];
  activePatientId: string | null;
  addPatient: (patient: IPatient) => void;
  removePatient: (patientId: string) => void;
  setActivePatient: (patientId: string) => void;
  setActiveSection: (patientId: string, section: WorkspaceSection) => void;
  updateOpenPatient: (patient: IPatient) => void;
}

const getShortName = (fullName: string) => {
  const parts = fullName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }
  return fullName;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  openPatients: [],
  activePatientId: null,
  
  addPatient: (patient) => set((state) => {
    const exists = state.openPatients.find(p => p.patient.patientId === patient.patientId);
    if (exists) {
      return { activePatientId: patient.patientId };
    }
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const newPatient: OpenPatient = {
      patient,
      shortName: getShortName(fullName),
      activeSection: 'patient'
    };
    return {
      openPatients: [...state.openPatients, newPatient],
      activePatientId: patient.patientId
    };
  }),

  removePatient: (patientId) => set((state) => {
    const newPatients = state.openPatients.filter(p => p.patient.patientId !== patientId);
    let newActiveId = state.activePatientId;
    if (state.activePatientId === patientId) {
      newActiveId = newPatients.length > 0 ? newPatients[newPatients.length - 1].patient.patientId : null;
    }
    return {
      openPatients: newPatients,
      activePatientId: newActiveId
    };
  }),

  setActivePatient: (patientId) => set({ activePatientId: patientId }),

  setActiveSection: (patientId, section) => set((state) => ({
    openPatients: state.openPatients.map(p => 
      p.patient.patientId === patientId ? { ...p, activeSection: section } : p
    )
  })),

  updateOpenPatient: (patient) => set((state) => ({
    openPatients: state.openPatients.map(p => 
      p.patient.patientId === patient.patientId 
        ? { ...p, patient, shortName: getShortName(`${patient.firstName} ${patient.lastName}`) }
        : p
    )
  }))
}));
