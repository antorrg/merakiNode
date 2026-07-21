import { Diagnosis, DiagnosisCreate, DiagnosisProps } from './Diagnosis.js';
import { DiagnosisRepository } from './DiagnosisRepository.js';

export class DiagnosisService {
  constructor(private repository: DiagnosisRepository) {}

  addDiagnosisToPatient(props: DiagnosisCreate): DiagnosisProps {
    const diagnosis = Diagnosis.register(props);
    this.repository.create(diagnosis.toPersistence());
    return diagnosis.toDTO();
  }

  getPatientDiagnoses(patientId: string) {
    const rows = this.repository.getByPatientId(patientId);
    return rows.map(row => {
      const diag = new Diagnosis(row);
      return diag.toDTO();
    });
  }

  getActivePatientDiagnoses(patientId: string) {
    const rows = this.repository.getActiveByPatientId(patientId);
    return rows.map(row => {
      const diag = new Diagnosis(row);
      return diag.toDTO();
    });
  }

  updateDiagnosis(diagnosisId: string, updates: Partial<Pick<DiagnosisProps, 'title' | 'description' | 'status' | 'endDate'>>) {
    const existing = this.repository.getById(diagnosisId);
    if (!existing) throw new Error('Diagnosis not found');

    const diagnosis = new Diagnosis(existing);
    diagnosis.update(updates);

    this.repository.update(diagnosisId, diagnosis.toPersistence());
    return diagnosis.toDTO();
  }

  deleteDiagnosis(diagnosisId: string) {
    return this.repository.delete(diagnosisId);
  }
}
