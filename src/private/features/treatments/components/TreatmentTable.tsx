import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import { ITreatment } from '../../../../types';

export interface TreatmentTableProps {
  treatments: ITreatment[];
  onOpenView: (treatment: ITreatment) => void;
  onOpenEdit: (treatment: ITreatment) => void;
  onOpenDelete: (treatment: ITreatment) => void;
}

const lineClampStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxHeight: '3em'
};

const TreatmentTable: React.FC<TreatmentTableProps> = ({
  treatments,
  onOpenView,
  onOpenEdit,
  onOpenDelete
}) => {
  return (
    <Table striped bordered hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Tratamiento</th>
          <th>Frecuencia</th>
          <th>Objetivo</th>
          <th style={{ width: '35%' }}>Descripción / Rutina</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {treatments.map((t) => (
          <tr key={t.treatmentId}>
            <td>
              <Button 
                variant="link" 
                className="p-0 text-primary fw-bold text-decoration-none text-start"
                onClick={() => onOpenView(t)}
                title="Haga clic para ver el detalle completo"
              >
                {t.name} 🔍
              </Button>
            </td>
            <td>
              {t.frequency ? (
                <Badge bg="light" text="dark" className="border">
                  {t.frequency}
                </Badge>
              ) : (
                '-'
              )}
            </td>
            <td className="small">{t.objective || '-'}</td>
            <td className="small">
              {t.description ? (
                <div>
                  <div 
                    style={lineClampStyle}
                    dangerouslySetInnerHTML={{ __html: t.description }} 
                  />
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none small text-muted mt-1" 
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => onOpenView(t)}
                  >
                    👁️ Ver detalle completo
                  </Button>
                </div>
              ) : (
                <span className="text-muted">Sin notas adicionales</span>
              )}
            </td>
            <td className="small">{t.startDate}</td>
            <td className="small">{t.endDate || 'En curso'}</td>
            <td className="text-center">
              <div className="d-flex justify-content-center gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => onOpenView(t)} title="Ver detalle">
                  👁️
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => onOpenEdit(t)} title="Editar">
                  ✏️
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onOpenDelete(t)} title="Eliminar">
                  🗑️
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TreatmentTable;
