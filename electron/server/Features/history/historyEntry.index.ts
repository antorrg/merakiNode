import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/historyEntry.schema.js';
import { historyEntryService } from '../../Shared/dependencies.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

export default {
  addEntry: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addEntrySchema);
    const patientId = NodeValidator.paramId(valid, 'patientId',  UuidHandler.regexUuid);
    const professionalId = NodeValidator.paramId(valid, 'professionalId',  UuidHandler.regexUuid);
    
    valid.patientId = patientId;
    valid.professionalId = professionalId;
    
    return historyEntryService.addEntry(valid);
  },
  
  updateEntry: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateEntrySchema);
    const { entryId, rest: updates } = NodeValidator.splitObjectProps(validData, ['entryId']);
    const validId = NodeValidator.paramId( {entryId},'entryId',  UuidHandler.regexUuid);
    
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));//eslint-disable-line
    return historyEntryService.updateEntry(validId, cleanUpdates );
  },
  
  deleteEntry: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteEntrySchema);
    const validId = NodeValidator.paramId(validData,'entryId', UuidHandler.regexUuid);
    return historyEntryService.deleteEntry(validId);
  },
  
  getPatientEntries: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.getPatientEntriesSchema);
    const patientId = NodeValidator.paramId(valid, 'patientId',  UuidHandler.regexUuid);
    
   const response = historyEntryService.getPatientEntries(patientId, valid.professionalId);
   return response
  }
}
