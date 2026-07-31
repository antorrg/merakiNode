import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { ITreatment } from '../../../../types';
import RichTextEditor from '../../../../shared/components/RichTextEditor/RichTextEditor';

export interface TreatmentEditData {
  name?: string;
  frequency?: string | null;
  objective?: string | null;
  description?: string | null;
  startDate?: string;
  endDate?: string | null;
}

export interface TreatmentEditModalProps {
  show: boolean;
  onHide: () => void;
  treatment: ITreatment | null;
  onSubmit: (treatmentId: string, data: TreatmentEditData) => Promise<void>;
}

const TreatmentEditModal: React.FC<TreatmentEditModalProps> = ({
  show,
  onHide,
  treatment,
  onSubmit
}) => {
  const [formData, setFormData] = useState<TreatmentEditData>({
    name: '',
    frequency: '',
    objective: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (treatment && show) {
      setFormData({
        name: treatment.name || '',
        frequency: treatment.frequency || '',
        objective: treatment.objective || '',
        description: treatment.description || '',
        startDate: treatment.startDate || '',
        endDate: treatment.endDate || ''
      });
    }
  }, [treatment, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatment || !formData.name?.trim()) return;

    await onSubmit(treatment.treatmentId, {
      name: formData.name.trim(),
      frequency: formData.frequency?.trim() || null,
      objective: formData.objective?.trim() || null,
      description: formData.description?.trim() || null,
      startDate: formData.startDate,
      endDate: formData.endDate || null
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fs-5 text-primary">Editar Tratamiento / Praxias</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Tratamiento</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Frecuencia / Posología</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.frequency || ''}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Objetivo Terapéutico</Form.Label>
            <Form.Control 
              type="text" 
              value={formData.objective || ''}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción / Rutina de Praxias (Editor Tiptap)</Form.Label>
            <RichTextEditor
              content={formData.description || ''}
              onChange={(html) => setFormData({ ...formData, description: html })}
              placeholder="Escriba la rutina detallada, viñetas de praxias o instrucciones..."
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Finalización</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ej. 30/12/2026 (dejar vacío si está en curso)"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Actualizar Tratamiento</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TreatmentEditModal;
