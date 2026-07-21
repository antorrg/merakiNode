import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/treatment.schema.js';
import { treatmentService } from '../../Shared/dependencies.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

export default {
  addTreatment: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addTreatmentSchema);
    const entryId = NodeValidator.paramId( valid, 'entryId',UuidHandler.regexUuid);
    (valid).entryId = entryId;
    return treatmentService.addTreatment(valid);
  },
  
  updateTreatment: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateTreatmentSchema);
    const { treatmentId, rest: updates } = NodeValidator.splitObjectProps(validData, ['treatmentId']);
    const validId = NodeValidator.paramId( {treatmentId},'treatmentId', UuidHandler.regexUuid);
    
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));//eslint-disable-line
    return treatmentService.updateTreatment(validId, cleanUpdates );
  },
  
  deleteTreatment: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteTreatmentSchema);
    const validId = NodeValidator.paramId( validData , 'treatmentId', UuidHandler.regexUuid);
    return treatmentService.deleteTreatment(validId);
  }
}
