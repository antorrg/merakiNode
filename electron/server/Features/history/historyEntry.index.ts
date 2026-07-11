import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/historyEntry.schema.js';
import { historyEntryService } from '../../Shared/dependencies.js';

export default {
  addEntry: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addEntrySchema);
    const patientId = NodeValidator.paramId('patientId', (valid as any).patientId, NodeValidator.ValidReg.UUIDv4);
    const professionalId = NodeValidator.paramId('professionalId', (valid as any).professionalId, NodeValidator.ValidReg.UUIDv4);
    
    (valid as any).patientId = patientId;
    (valid as any).professionalId = professionalId;
    
    return historyEntryService.addEntry(valid as any);
  },
  
  updateEntry: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateEntrySchema);
    const { entryId, ...updates } = NodeValidator.splitObjectProps(validData, ['entryId']);
    const validId = NodeValidator.paramId('entryId', entryId, NodeValidator.ValidReg.UUIDv4);
    
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    return historyEntryService.updateEntry(validId, cleanUpdates as any);
  },
  
  deleteEntry: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteEntrySchema);
    const validId = NodeValidator.paramId('entryId', (validData as any).entryId, NodeValidator.ValidReg.UUIDv4);
    return historyEntryService.deleteEntry(validId);
  }
}
