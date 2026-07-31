import { Treatment, TreatmentCreate, TreatmentProps } from './Treatment.js';
import { TreatmentRepository } from './TreatmentRepository.js';

export class TreatmentService {
  constructor(private repository: TreatmentRepository) {}

  addTreatment(props: TreatmentCreate): TreatmentProps {
    const treatment = Treatment.register(props);
    this.repository.create(treatment.toPersistence());
    return treatment.toDTO();
  }

  getTreatmentsByEntry(entryId: string) {
    const rows = this.repository.getByEntryId(entryId);
    return rows.map(row => {
      const treatment = new Treatment(row);
      return treatment.toDTO();
    });
  }

  getTreatmentsByPatient(patientId: string) {
    const rows = this.repository.getByPatientId(patientId);
    return rows.map(row => {
      const treatment = new Treatment(row);
      return treatment.toDTO();
    });
  }

  updateTreatment(treatmentId: string, updates: Partial<Omit<TreatmentProps, 'treatmentId' | 'entryId' | 'deletedAt'>>) {
    const existing = this.repository.getById(treatmentId);
    if (!existing) throw new Error('Treatment not found');

    const treatment = new Treatment(existing);
    treatment.update(updates);

    this.repository.update(treatmentId, treatment.toPersistence());
    return treatment.toDTO();
  }

  deleteTreatment(treatmentId: string) {
    return this.repository.delete(treatmentId);
  }
}
