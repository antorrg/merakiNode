import React from 'react';
import dayjs from 'dayjs';
import { IAppointment } from '../../shared/types/appointment.types';

interface WelcomeStatusCardProps {
  activeTurn: IAppointment | undefined;
  nextTurn: IAppointment | undefined;
  completedCount: number;
  isProfessional: boolean;
  onGoToPatients: () => void;
}

export const WelcomeStatusCard: React.FC<WelcomeStatusCardProps> = ({
  activeTurn,
  nextTurn,
  completedCount,
  isProfessional,
  onGoToPatients,
}) => {
  return (
    <div className="col-12 col-lg-6">
      <div className="bg-white p-4 rounded shadow-sm border h-100 d-flex flex-column justify-content-between">
        <div>
          <h3 className="h5 fw-bold mb-3 text-dark d-flex align-items-center">
            <svg className="me-2 text-warning" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
            </svg>
            Estado de Turnos
          </h3>

          {/* ALERTA: TURNO ACTUALMENTE EN CURSO */}
          {activeTurn ? (
            <div className="p-3 bg-success-subtle rounded border border-success mb-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-success text-white px-2 py-1 align-middle">
                  <span className="spinner-grow spinner-grow-sm me-1" role="status" style={{ width: '0.6rem', height: '0.6rem' }}></span>
                  TURNO EN CURSO
                </span>
                <span className="fw-bold text-success small">
                  {dayjs(activeTurn.startTime).format('HH:mm')} - {dayjs(activeTurn.endTime).format('HH:mm')} hs
                </span>
              </div>
              <div className="fw-bold fs-6 text-dark mt-2">
                {activeTurn.patientName || 'Paciente sin nombre'}
              </div>
              <div className="text-muted small">
                Servicio: <strong>{activeTurn.service}</strong>
                {!isProfessional && activeTurn.professionalName && (
                  <span> | Prof: {activeTurn.professionalName}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-light rounded border text-muted small mb-3 d-flex align-items-center">
              <span className="badge bg-secondary me-2">Info</span>
              No hay turnos en curso en este instante.
            </div>
          )}

          {/* SECCIÓN: PRÓXIMO TURNO */}
          {nextTurn ? (
            <div className="p-3 bg-primary-subtle rounded border border-primary-subtle mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-primary text-white">Próximo Turno</span>
                <span className="fw-semibold text-primary small">
                  {dayjs(nextTurn.startTime).format('HH:mm')} hs
                </span>
              </div>
              <div className="fw-bold text-dark">
                {nextTurn.patientName || 'Paciente'}
              </div>
              <div className="text-muted small">
                {nextTurn.service}
                {!isProfessional && nextTurn.professionalName && (
                  <span> - Prof: {nextTurn.professionalName}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-light rounded border text-muted small mb-3">
              No restan más turnos agendados para el día.
            </div>
          )}

          {/* SECCIÓN: TURNOS TERMINADOS */}
          <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light border">
            <span className="text-muted small">Turnos completados hoy:</span>
            <span className="badge bg-info text-dark px-2 py-1">
              {completedCount} finalizados
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
          <span className="text-muted small">Acceso directo a pacientes</span>
          <button 
            onClick={onGoToPatients}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
          >
            Pacientes &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
