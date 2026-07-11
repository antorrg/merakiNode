import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/diagnosis.schema.js';
import { diagnosisService } from '../../Shared/dependencies.js';

export default {
  addDiagnosisToPatient: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.addDiagnosisSchema);
    const patientId = NodeValidator.paramId('patientId', (valid as any).patientId, NodeValidator.ValidReg.UUIDv4);
    (valid as any).patientId = patientId;
    return diagnosisService.addDiagnosisToPatient(valid as any);
  },
  
  updateDiagnosis: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateDiagnosisSchema);
    const { diagnosisId, ...updates } = NodeValidator.splitObjectProps(validData, ['diagnosisId']);
    const validId = NodeValidator.paramId('diagnosisId', diagnosisId, NodeValidator.ValidReg.UUIDv4);
    
    // Eliminamos undefined
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
    return diagnosisService.updateDiagnosis(validId, cleanUpdates as any);
  },
  
  deleteDiagnosis: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteDiagnosisSchema);
    const validId = NodeValidator.paramId('diagnosisId', (validData as any).diagnosisId, NodeValidator.ValidReg.UUIDv4);
    return diagnosisService.deleteDiagnosis(validId);
  }
}
