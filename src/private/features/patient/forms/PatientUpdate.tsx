import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { PatientActionType } from '../patientModalConfigs';
import { usePatientStore } from '../usePatientStore';

interface PatientUpdateProps {
  patientId: string;
  onHide: () => void;
  onRequestConfirm: (action: PatientActionType, data: any) => void;
}

const PatientUpdate: React.FC<PatientUpdateProps> = ({ patientId, onHide, onRequestConfirm }) => {
  const { patients } = usePatientStore();
  const patient = patients.find(p => p.patientId === patientId);

  const [formData, setFormData] = useState({
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        phone: (patient as any).phone || '', 
        email: patient.email || ''  
      });
    }
  }, [patient]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestConfirm('UPDATE', { patientId, ...formData });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <p className="text-muted mb-4">Actualmente solo se permite la actualización de los datos de contacto.</p>
      
      <Form.Group className="mb-3">
        <Form.Label>Teléfono</Form.Label>
        <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Correo Electrónico</Form.Label>
        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" type="submit">Guardar y Confirmar</Button>
      </div>
    </Form>
  );
};

export default PatientUpdate;
