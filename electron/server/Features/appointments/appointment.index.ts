import { AppointmentService } from './AppointmentService.js';
import * as sch from './schemas/appointment.schema.js';
import { NodeValidator } from 'req-valid-express';
import { UuidHandler } from '../../Shared/Utils/UuidHandler.js';

const appointmentService = new AppointmentService();

export default {
  createAppointment: (data: unknown) => {
    const validData: any = NodeValidator.validateBody(data, sch.createAppointmentSchema);
    const patientId = NodeValidator.paramId(validData, 'patientId', UuidHandler.regexUuid);
    const professionalId = NodeValidator.paramId(validData, 'professionalId', UuidHandler.regexUuid);
    
    // Inyectar createdBy desde sessionClient si existe, o usar el que viene en validData
    const createdBy = validData.sessionClient?.userId || validData.createdBy || professionalId;

    return appointmentService.createAppointment({
      ...validData,
      patientId,
      professionalId,
      createdBy
    });
  },

  getAppointmentsByRange: (data: unknown) => {
    const validData: any = NodeValidator.validateBody(data, sch.getByRangeSchema);
    return appointmentService.getAppointmentsByRange(validData.startDate, validData.endDate, validData.professionalId || undefined);
  },

  getAppointmentsByPatient: (data: unknown) => {
    const validData: any = NodeValidator.validateBody(data, sch.getByPatientSchema);
    const patientId = NodeValidator.paramId(validData, 'patientId', UuidHandler.regexUuid);
    return appointmentService.getAppointmentsByPatient(patientId);
  },

  updateAppointmentStatus: (data: unknown) => {
    const validData: any = NodeValidator.validateBody(data, sch.updateStatusSchema);
    const appointmentId = NodeValidator.paramId(validData, 'appointmentId', UuidHandler.regexUuid);
    return appointmentService.updateAppointmentStatus(appointmentId, validData.status, validData.notes);
  },

  deleteAppointment: (data: unknown) => {
    const validData: any = NodeValidator.validateBody(data, sch.deleteAppointmentSchema);
    const appointmentId = NodeValidator.paramId(validData, 'appointmentId', UuidHandler.regexUuid);
    return appointmentService.deleteAppointment(appointmentId);
  }
};
