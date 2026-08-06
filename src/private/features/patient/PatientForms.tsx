import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PatientCreate from './forms/PatientCreate';
import PatientUpdate from './forms/PatientUpdate';
import { PatientActionType } from './patientModalConfigs';

interface PatientFormsProps {
  show: boolean;
  onHide: () => void;
  mode: PatientActionType;
  selectedPatientId?: string;
  onRequestConfirm: (action: PatientActionType, data: any) => void;
}

const PatientForms: React.FC<PatientFormsProps> = ({ show, onHide, mode, selectedPatientId, onRequestConfirm }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static" 
      size="lg" 
      scrollable
      style={{ '--bs-modal-width': '920px' } as React.CSSProperties}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'CREATE' ? 'Registrar Nuevo Paciente' : 'Actualizar Datos del Paciente'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mode === 'CREATE' && <PatientCreate onHide={onHide} onRequestConfirm={onRequestConfirm} />}
        {mode === 'UPDATE' && selectedPatientId && <PatientUpdate onHide={onHide} patientId={selectedPatientId} onRequestConfirm={onRequestConfirm} />}
      </Modal.Body>
    </Modal>
  );
};

export default PatientForms;
