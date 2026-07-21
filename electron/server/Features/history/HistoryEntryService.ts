import { HistoryEntry, HistoryEntryCreate, HistoryEntryProps } from './HistoryEntry.js';
import { HistoryEntryRepository } from './HistoryEntryRepository.js';

export class HistoryEntryService {
  constructor(private repository: HistoryEntryRepository) {}

  addEntry(props: HistoryEntryCreate & { diagnosisIds?: string[] }): HistoryEntryProps & { diagnosisIds?: string[] } {
    const { diagnosisIds, ...entryProps } = props;
    const entry = HistoryEntry.register(entryProps);
    this.repository.create(entry.toPersistence(), diagnosisIds || []);
    
    const dto = entry.toDTO() as HistoryEntryProps & { diagnosisIds?: string[] };
    dto.diagnosisIds = diagnosisIds || [];
    return dto;
  }

  getPatientEntries(patientId: string, professionalId?: string) {
    const rows = this.repository.getByPatientId(patientId, professionalId);
    return rows.map(row => {
      const entry = new HistoryEntry(row);
      return entry.toDTO();
    });
  }

  updateEntry(entryId: string, updates: Partial<Omit<HistoryEntryProps, 'entryId' | 'patientId' | 'professionalId' | 'deletedAt'>> & { diagnosisIds?: string[] }) {
    const existing = this.repository.getById(entryId);
    if (!existing) throw new Error('History entry not found');
    const entry = new HistoryEntry(existing);

    const { diagnosisIds, ...domainUpdates } = updates;
    entry.update(domainUpdates);

    const infoUpdated = entry.toPersistence()
    
    this.repository.update(entryId, infoUpdated);
    if (diagnosisIds !== undefined) {
      this.repository.linkDiagnoses(entryId, diagnosisIds);
    }
    
    const dto = entry.toDTO() as HistoryEntryProps & { diagnosisIds?: string[] };
    dto.diagnosisIds = diagnosisIds !== undefined ? diagnosisIds : existing.diagnosisIds;
    return dto;
  }

  deleteEntry(entryId: string) {
    return this.repository.delete(entryId);
  }
}
