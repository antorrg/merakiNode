import { NodeValidator } from 'req-valid-express';
import * as sch from './schemas/patient.schema.js';
import { patientService } from '../../Shared/dependencies.js';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

export default {
  registerPatient: (data: unknown) => {
    const valid = NodeValidator.validateBody(data, sch.registerPatientSchema);
    return patientService.registerPatient(valid);
  },
  
  getPatients: (data: unknown) => {
   return patientService.getAllPatients(data || {});
  },
  
  getPatientById: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.getByIdSchema);
    const validId = NodeValidator.paramId(validData,'patientId',  UuidHandler.regexUuid);
    return  patientService.getPatientById(validId);
  },
  
  updateContactData: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.updateContactSchema);
    const { patientId, rest } = NodeValidator.splitObjectProps(validData, ['patientId']);
    const { phone, email } = rest as any;
    const validId = NodeValidator.paramId({patientId},'patientId',UuidHandler.regexUuid);
    return patientService.updatePatientContact(validId, phone as string, email as string | null);
  },

  deletePatient: (data: unknown) => {
    const validData = NodeValidator.validateBody(data, sch.deleteSchema);
    const validId = NodeValidator.paramId(validData, 'patientId',  UuidHandler.regexUuid);
    return patientService.deletePatient(validId);
  }
}
