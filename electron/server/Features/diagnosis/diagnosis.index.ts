import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/diagnosis.schema.js';
import { diagnosisService } from '../../Shared/dependencies.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

export default {
  addDiagnosisToPatient: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addDiagnosisSchema);
    const patientId = NodeValidator.paramId(valid, 'patientId', UuidHandler.regexUuid);
    (valid).patientId = patientId;
    return diagnosisService.addDiagnosisToPatient(valid);
  },

  getActiveDiagnoses: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.getByPatientSchema);
    const patientId = NodeValidator.paramId(valid, 'patientId', UuidHandler.regexUuid);
    return diagnosisService.getActivePatientDiagnoses(patientId);
  },
  
  updateDiagnosis: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateDiagnosisSchema);
    const { diagnosisId, rest: updates } = NodeValidator.splitObjectProps(validData, ['diagnosisId']);
    const validId = NodeValidator.paramId({diagnosisId},'diagnosisId',  UuidHandler.regexUuid);
    
    // Eliminamos undefined
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));//eslint-disable-line
    return diagnosisService.updateDiagnosis(validId, cleanUpdates);
  },
  
  deleteDiagnosis: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteDiagnosisSchema);
    const validId = NodeValidator.paramId(validData, 'diagnosisId', UuidHandler.regexUuid);
    return diagnosisService.deleteDiagnosis(validId);
  }
}
