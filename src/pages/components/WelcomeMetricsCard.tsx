import React from 'react';

interface WelcomeMetricsCardProps {
  uniquePatientsCount: number;
  totalAppointments: number;
  confirmedCount: number;
  pendingCount: number;
  completedCount: number;
  isProfessional: boolean;
  openPatients: Array<{ patient?: { patientId: string; firstName: string; lastName: string } }>;
  onGoToWorkspace: () => void;
  onGoToCalendar: () => void;
}

export const WelcomeMetricsCard: React.FC<WelcomeMetricsCardProps> = ({
  uniquePatientsCount,
  totalAppointments,
  confirmedCount,
  pendingCount,
  completedCount,
  isProfessional,
  openPatients,
  onGoToWorkspace,
  onGoToCalendar,
}) => {
  return (
    <div className="col-12 col-lg-6">
      <div className="bg-white p-4 rounded shadow-sm border h-100 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="h5 fw-bold mb-0 text-dark">
              <svg className="me-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
              </svg>
              Pacientes Hoy
            </h3>
            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
              {uniquePatientsCount} {uniquePatientsCount === 1 ? 'paciente' : 'pacientes'}
            </span>
          </div>

          <p className="text-muted small mb-3">
            {isProfessional 
              ? 'Resumen de tus turnos citados para la jornada de hoy.' 
              : 'Resumen consolidado de turnos y pacientes para el día de hoy en el centro.'}
          </p>

          <div className="row g-2 text-center">
            <div className="col-6 col-sm-3">
              <div className="p-2 bg-light rounded border">
                <div className="fs-4 fw-bold text-primary">{totalAppointments}</div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>Total Turnos</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 bg-success-subtle rounded border border-success-subtle">
                <div className="fs-4 fw-bold text-success">{confirmedCount}</div>
                <div className="text-success text-truncate" style={{ fontSize: '0.75rem' }}>Confirmados</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 bg-warning-subtle rounded border border-warning-subtle">
                <div className="fs-4 fw-bold text-warning-emphasis">{pendingCount}</div>
                <div className="text-warning-emphasis text-truncate" style={{ fontSize: '0.75rem' }}>Pendientes</div>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2 bg-info-subtle rounded border border-info-subtle">
                <div className="fs-4 fw-bold text-info-emphasis">{completedCount}</div>
                <div className="text-info-emphasis text-truncate" style={{ fontSize: '0.75rem' }}>Completados</div>
              </div>
            </div>
          </div>
        </div>

        {openPatients && openPatients.length > 0 && (
          <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
            <div className="row g-2 text-center">
              <div className="p-2 bg-danger-subtle rounded border border-danger-subtle">
                <div className="fs-4 fw-bold text-danger-emphasis">{openPatients.length}</div>
                <div className="text-danger-emphasis text-truncate" style={{ fontSize: '0.75rem' }}>Pacientes en edición</div>
              </div>
            </div>
            <div 
              className="d-flex align-items-center justify-content-between p-1 rounded bg-secondary-subtle border"
              style={{ minWidth: '40%' }}
            >
              <ul className="list-unstyled mb-0 w-100">
                {openPatients.map((p) => (
                  <li 
                    key={p.patient?.patientId || Math.random().toString()}
                    className="p-1 bg-secondary-subtle rounded border text-muted small mb-1"
                  >
                    {p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : 'Paciente'}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={onGoToWorkspace}
              className="btn btn-outline-primary btn-sm rounded-pill px-3"
            >
              Ir &rarr;
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
          <span className="text-muted small">¿Deseas gestionar la agenda?</span>
          <button 
            onClick={onGoToCalendar}
            className="btn btn-outline-primary btn-sm rounded-pill px-3"
          >
            Ir al Calendario &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
