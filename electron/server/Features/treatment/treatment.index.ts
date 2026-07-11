import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/treatment.schema.js';
import { treatmentService } from '../../Shared/dependencies.js';

export default {
  addTreatment: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addTreatmentSchema);
    const entryId = NodeValidator.paramId('entryId', (valid as any).entryId, NodeValidator.ValidReg.UUIDv4);
    (valid as any).entryId = entryId;
    return treatmentService.addTreatment(valid as any);
  },
  
  updateTreatment: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateTreatmentSchema);
    const { treatmentId, ...updates } = NodeValidator.splitObjectProps(validData, ['treatmentId']);
    const validId = NodeValidator.paramId('treatmentId', treatmentId, NodeValidator.ValidReg.UUIDv4);
    
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    return treatmentService.updateTreatment(validId, cleanUpdates as any);
  },
  
  deleteTreatment: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteTreatmentSchema);
    const validId = NodeValidator.paramId('treatmentId', (validData as any).treatmentId, NodeValidator.ValidReg.UUIDv4);
    return treatmentService.deleteTreatment(validId);
  }
}
