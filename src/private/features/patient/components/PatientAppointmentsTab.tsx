import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useAppointmentStore } from '../../calendar/useAppointmentStore';
import { AppointmentModal } from '../../calendar/components/AppointmentModal';
import { IAppointment } from '../../../../shared/types/appointment.types';
import Spinner from 'react-bootstrap/Spinner';

interface PatientAppointmentsTabProps {
  patientId: string;
}

export const PatientAppointmentsTab: React.FC<PatientAppointmentsTabProps> = ({ patientId }) => {
  const { patientAppointments, fetchPatientAppointments, isLoading } = useAppointmentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientAppointments(patientId);
    }
  }, [patientId, fetchPatientAppointments]);

  const handleOpenNewModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectAppointment = (app: IAppointment) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  return (
    <div className="mt-4 bg-white p-3 rounded border shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 text-primary">📅 Turnos del Paciente</h5>
        <button className="btn btn-primary btn-sm" onClick={handleOpenNewModal}>
          + Agendar Nuevo Turno
        </button>
      </div>

      {isLoading && patientAppointments.length === 0 ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <span className="ms-2 text-muted">Cargando turnos...</span>
        </div>
      ) : patientAppointments.length === 0 ? (
        <div className="alert alert-light text-center border my-2">
          No hay turnos registrados para este paciente.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha y Hora</th>
                <th>Servicio / Motivo</th>
                <th>Profesional</th>
                <th>Estado</th>
                <th>Notas</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {patientAppointments.map(app => {
                const start = dayjs(app.startTime);
                const end = dayjs(app.endTime);
                const isCancelled = app.status === 'CANCELLED';

                return (
                  <tr key={app.appointmentId} className={isCancelled ? 'table-danger' : ''}>
                    <td>
                      <div className="fw-bold">{start.format('DD/MM/YYYY')}</div>
                      <small className="text-muted">
                        {start.format('HH:mm')} - {end.format('HH:mm')}
                      </small>
                    </td>
                    <td>{app.service}</td>
                    <td>{app.professionalName || 'Dr. Asignado'}</td>
                    <td>
                      <span
                        className={`badge ${
                          app.status === 'CONFIRMED'
                            ? 'bg-success'
                            : app.status === 'CANCELLED'
                            ? 'bg-danger text-white'
                            : app.status === 'COMPLETED'
                            ? 'bg-primary'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {app.status === 'CANCELLED' ? 'CANCELADO (En Rojo)' : app.status}
                      </span>
                    </td>
                    <td>
                      <small className={isCancelled ? 'text-danger fw-bold' : 'text-muted'}>
                        {app.notes || '-'}
                      </small>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleSelectAppointment(app)}
                      >
                        Ver / Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de agendamiento para este paciente */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fixedPatientId={patientId}
        existingAppointment={selectedAppointment}
        onSuccess={() => fetchPatientAppointments(patientId)}
      />
    </div>
  );
};
