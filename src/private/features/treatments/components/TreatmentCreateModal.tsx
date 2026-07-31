import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { IHistoryEntry } from '../../../../types';
import RichTextEditor from '../../../../shared/components/RichTextEditor/RichTextEditor';

export interface TreatmentCreateData {
  entryId: string;
  name: string;
  frequency?: string | null;
  objective?: string | null;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface TreatmentCreateModalProps {
  show: boolean;
  onHide: () => void;
  historyEntries: IHistoryEntry[];
  loadingEntries: boolean;
  onSubmit: (data: TreatmentCreateData) => Promise<void>;
}

const TreatmentCreateModal: React.FC<TreatmentCreateModalProps> = ({
  show,
  onHide,
  historyEntries,
  loadingEntries,
  onSubmit
}) => {
  const [formData, setFormData] = useState<TreatmentCreateData>({
    entryId: '',
    name: '',
    frequency: '',
    objective: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    if (show) {
      const defaultEntryId = historyEntries.length > 0 ? historyEntries[0].entryId : '';
      setFormData({
        entryId: defaultEntryId,
        name: '',
        frequency: '',
        objective: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    }
  }, [show, historyEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.entryId) return;

    await onSubmit({
      entryId: formData.entryId,
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
        <Modal.Title className="fs-5 text-primary">Asignar Tratamiento / Praxias</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Consulta / Entrada Médica Vinculada</Form.Label>
            {loadingEntries ? (
              <div className="small text-muted mb-2">Cargando consultas...</div>
            ) : historyEntries.length > 0 ? (
              <Form.Select 
                value={formData.entryId} 
                onChange={(e) => setFormData({ ...formData, entryId: e.target.value })}
                required
              >
                {historyEntries.map((e) => (
                  <option key={e.entryId} value={e.entryId}>
                    {e.visitDate} - {e.reason || 'Consulta Médica'}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control 
                type="text" 
                placeholder="Ingrese el ID de entrada o cree una consulta primero"
                value={formData.entryId}
                onChange={(e) => setFormData({ ...formData, entryId: e.target.value })}
                required
              />
            )}
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Tratamiento / Medicamento / Praxia</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Ej. Ejercicios de praxias labiales, Ibuprofeno 400mg..."
                  value={formData.name}
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
                  placeholder="Ej. 2 veces al día, Cada 8 horas..."
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
              placeholder="Ej. Fortalecimiento del tono muscular lingual, Control de presión..."
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
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Finalización (Opcional)</Form.Label>
                <Form.Control 
                  type="date" 
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar Tratamiento</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TreatmentCreateModal;
