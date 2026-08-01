import React from 'react';
import { PatientAppointmentsTab } from '../patient/components/PatientAppointmentsTab';

interface PatientCalendarProps {
  patientId: string;
}

const PatientCalendar: React.FC<PatientCalendarProps> = ({ patientId }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <h4 className="mb-2 text-primary fw-bold">Agenda y Turnos del Paciente</h4>
      <p className="text-muted small mb-3">
        Historial completo de turnos agendados, confirmados y cancelados para este paciente.
      </p>

      <PatientAppointmentsTab patientId={patientId} />
    </div>
  );
};

export default PatientCalendar;
