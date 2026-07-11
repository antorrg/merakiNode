import { HistoryEntry, HistoryEntryCreate, HistoryEntryProps } from './HistoryEntry.js';
import { HistoryEntryRepository } from './HistoryEntryRepository.js';

export class HistoryEntryService {
  constructor(private repository: HistoryEntryRepository) {}

  addEntry(props: HistoryEntryCreate): HistoryEntryProps {
    const entry = HistoryEntry.register(props);
    this.repository.create(entry.toPersistence());
    return entry.toDTO();
  }

  getPatientEntries(patientId: string) {
    const rows = this.repository.getByPatientId(patientId);
    return rows.map(row => {
      const entry = new HistoryEntry(row);
      return entry.toDTO();
    });
  }

  updateEntry(entryId: string, updates: Partial<Omit<HistoryEntryProps, 'entryId' | 'patientId' | 'professionalId' | 'deletedAt'>>) {
    const existing = this.repository.getById(entryId);
    if (!existing) throw new Error('History entry not found');

    const entry = new HistoryEntry(existing);
    entry.update(updates);

    this.repository.update(entryId, entry.toPersistence());
    return entry.toDTO();
  }

  deleteEntry(entryId: string) {
    return this.repository.delete(entryId);
  }
}
