import React from 'react';

interface WelcomeHeaderCardProps {
  greet: string;
  userRole: string;
  fecha: string;
}

export const WelcomeHeaderCard: React.FC<WelcomeHeaderCardProps> = ({ greet, userRole, fecha }) => {
  return (
    <div className="col-12">
      <div className="bg-white p-4 rounded shadow-sm border d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <div>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 mb-2 rounded-pill">
            ¡Sesión Iniciada!
          </span>
          <h1 className="h2 fw-bold text-primary mb-1">Meraki Espacio Integral</h1>
          <h2 className="h5 text-secondary mb-0">
            ¡Hola <strong>{greet}</strong>! <span className="badge bg-secondary ms-1">{userRole}</span>
          </h2>
        </div>
        <div className="text-md-end bg-light p-3 rounded border">
          <div className="text-uppercase text-muted small fw-semibold">Fecha de hoy</div>
          <div className="h6 mb-0 text-dark fw-bold">{fecha}</div>
        </div>
      </div>
    </div>
  );
};
