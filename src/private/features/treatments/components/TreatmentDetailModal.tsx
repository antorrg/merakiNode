import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ITreatment } from '../../../../types';

export interface TreatmentDetailModalProps {
  show: boolean;
  onHide: () => void;
  treatment: ITreatment | null;
  onOpenEdit: (treatment: ITreatment) => void;
}

const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  show,
  onHide,
  treatment,
  onOpenEdit
}) => {
  if (!treatment) return null;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fs-5 text-primary">
          💊 {treatment.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="row mb-3 bg-light p-3 rounded border mx-0">
          <div className="col-md-6 mb-2">
            <strong className="text-secondary small d-block">Frecuencia / Posología:</strong>
            <span>{treatment.frequency || 'No especificada'}</span>
          </div>
          <div className="col-md-6 mb-2">
            <strong className="text-secondary small d-block">Objetivo Terapéutico:</strong>
            <span>{treatment.objective || 'No especificado'}</span>
          </div>
          <div className="col-md-6">
            <strong className="text-secondary small d-block">Fecha de Inicio:</strong>
            <span>{treatment.startDate}</span>
          </div>
          <div className="col-md-6">
            <strong className="text-secondary small d-block">Fecha de Finalización:</strong>
            <span>{treatment.endDate || 'En curso'}</span>
          </div>
        </div>

        <h6 className="fw-bold text-secondary mb-2">Descripción y Rutina de Praxias / Indicaciones:</h6>
        <div className="p-3 border rounded bg-white shadow-sm" style={{ minHeight: '120px' }}>
          {treatment.description ? (
            <div dangerouslySetInnerHTML={{ __html: treatment.description }} />
          ) : (
            <p className="text-muted small mb-0 italic">Sin descripción o instrucciones adicionales.</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="outline-secondary" 
          onClick={() => {
            onHide();
            onOpenEdit(treatment);
          }}
        >
          ✏️ Editar este Tratamiento
        </Button>
        <Button variant="primary" onClick={onHide}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TreatmentDetailModal;
