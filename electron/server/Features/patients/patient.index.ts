import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/patient.schema.js';
import { patientService } from '../../Shared/dependencies.js';

export default {
  registerPatient: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.registerPatientSchema);
    return patientService.registerPatient(valid as any);
  },
  
  getPatients: () => {
    return patientService.getAllPatients();
  },
  
  getPatientById: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.getByIdSchema);
    const validId = NodeValidator.paramId('patientId', (validData as any).patientId, NodeValidator.ValidReg.UUIDv4);
    return patientService.getPatientById(validId);
  },
  
  updateContactData: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateContactSchema);
    const { patientId, phone, email } = NodeValidator.splitObjectProps(validData, ['patientId']);
    const validId = NodeValidator.paramId('patientId', patientId, NodeValidator.ValidReg.UUIDv4);
    return patientService.updatePatientContact(validId, phone as string, email as string | null);
  }
}
