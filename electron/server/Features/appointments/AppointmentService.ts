import { AppointmentRepository } from './AppointmentRepository.js';
import { Appointment, AppointmentStatus, AppointmentCreate } from './Appointment.js';
import { throwError } from '../../Configs/Errors/ErrorHandler.js';
import { ErrorCode } from '../../Configs/Errors/errorCode.js';

export class AppointmentService {
  private repository: AppointmentRepository;

  constructor(repository: AppointmentRepository) {
    this.repository = repository;
  }

  createAppointment(data: AppointmentCreate) {
    const appointment = Appointment.register(data);
    const persistenceData = appointment.toPersistence();

    // Verificar solapamiento de horario para el mismo profesional (solo turnos activos)
    const isOverlapping = this.repository.checkOverlap(
      persistenceData.professional_id,
      persistenceData.start_time,
      persistenceData.end_time
    );

    if (isOverlapping) {
      throwError('El profesional ya cuenta con un turno agendado en esa franja horaria.', ErrorCode.CLIENT_STATE_INVALID);
    }

    this.repository.create(persistenceData);
    return appointment.toDTO();
  }

  getAppointmentsByRange(startDate: string, endDate: string, professionalId?: string) {
    return this.repository.getByDateRange(startDate, endDate, professionalId);
  }

  getAppointmentsByPatient(patientId: string) {
    return this.repository.getByPatientId(patientId);
  }

  updateAppointmentStatus(appointmentId: string, status: string, notes?: string) {
    const existing = this.repository.getById(appointmentId);
    if (!existing) {
      throwError('Turno no encontrado', ErrorCode.NOT_FOUND);
    }

    const validStatus = status.toUpperCase() as AppointmentStatus;
    if (!Object.values(AppointmentStatus).includes(validStatus)) {
      throwError('Estado de turno inválido', ErrorCode.CLIENT_STATE_INVALID);
    }

    const appointment = new Appointment(existing!);
    appointment.updateStatus(validStatus, notes);

    this.repository.update(appointmentId, appointment.toPersistence());
    return appointment.toDTO();
  }

  deleteAppointment(appointmentId: string) {
    const existing = this.repository.getById(appointmentId);
    if (!existing) {
      throwError('Turno no encontrado', ErrorCode.NOT_FOUND);
    }
    return this.repository.delete(appointmentId);
  }
}
