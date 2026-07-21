import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Spinner, Badge, InputGroup, Accordion } from 'react-bootstrap';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import { useDiagnosisStore } from '../diagnostic/useDiagnosisStore';
import { useWorkspaceStore } from '../patient/workspace/useWorkspaceStore';
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor';
import { VisitType, DiagnosisStatus } from '../../../shared/types';

interface HistoryEntryProps {
  patientId: string;
}

const HistoryEntry = ({ patientId }: HistoryEntryProps) => {
  const { draftsByPatient, setDraft, clearDraft, saveNewEntry, isLoading: isEntryLoading } = useHistoryEntryStore();
  const { activeDiagnosesByPatient, fetchActiveDiagnoses, createDiagnosis, isLoading: isDiagLoading } = useDiagnosisStore();
  
  const draft = draftsByPatient[patientId] || {};
  const activeDiagnoses = activeDiagnosesByPatient[patientId] || [];
  
  const [newDiagTitle, setNewDiagTitle] = useState('');

  // Inicializar con valores por defecto si está vacío
  useEffect(() => {
    if (!draft.visitType) {
      setDraft(patientId, { visitType: VisitType.PRESENTIAL, diagnosisIds: [] });
    }
  }, [patientId, draft.visitType, setDraft]);

  // Cargar diagnósticos activos al montar
  useEffect(() => {
    fetchActiveDiagnoses(patientId);
  }, [patientId, fetchActiveDiagnoses]);

  const handleSave = async () => {
    const success = await saveNewEntry(patientId);
    if (success) {
      useWorkspaceStore.getState().setActiveSection(patientId, 'history');
    }
  };

  const handleCreateDiagnosis = async () => {
    if (newDiagTitle.trim().length >= 2) {
      const newDiag = await createDiagnosis(patientId, newDiagTitle.trim(), DiagnosisStatus.ACTIVE);
      if (newDiag) {
        setNewDiagTitle('');
        // Auto-seleccionar el nuevo diagnóstico
        const currentIds = draft.diagnosisIds || [];
        setDraft(patientId, { diagnosisIds: [...currentIds, newDiag.diagnosisId] });
      }
    }
  };

  const toggleDiagnosis = (diagId: string) => {
    const currentIds = draft.diagnosisIds || [];
    if (currentIds.includes(diagId)) {
      setDraft(patientId, { diagnosisIds: currentIds.filter(id => id !== diagId) });
    } else {
      setDraft(patientId, { diagnosisIds: [...currentIds, diagId] });
    }
  };

  const handleCancelEdit = () => {
    clearDraft(patientId);
    useWorkspaceStore.getState().setActiveSection(patientId, 'history');
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-primary m-0">
          {draft.entryId ? '✏️ Editando Evolución' : 'Nueva Evolución'}
        </h4>
        <div className="d-flex gap-2">
          {draft.entryId && (
            <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={isEntryLoading}>
              Cancelar
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={isEntryLoading || !draft.reason || draft.reason.trim().length < 2}
          >
            {isEntryLoading ? <Spinner size="sm" /> : (draft.entryId ? 'Guardar Cambios' : 'Guardar Evolución')}
          </Button>
        </div>
      </div>

      <Form>
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-medium text-secondary">Tipo de Visita</Form.Label>
              <Form.Select 
                value={draft.visitType || ''} 
                onChange={(e) => setDraft(patientId, { visitType: e.target.value as VisitType })}
              >
                <option value={VisitType.PRESENTIAL}>Presencial</option>
                <option value={VisitType.VIRTUAL}>Virtual</option>
                <option value={VisitType.PHONE}>Telefónica</option>
                <option value={VisitType.REPORT}>Reporte / Estudio</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label className="fw-medium text-secondary">Motivo o Título de la Sesión *</Form.Label>
              <Form.Control 
                type="text" 
                maxLength={80}
                placeholder="Ej. Evaluación inicial, Sesión de estimulación #3..." 
                value={draft.reason || ''} 
                onChange={(e) => setDraft(patientId, { reason: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-medium text-secondary">Diagnósticos Tratados en esta Visita</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2 p-3 bg-light rounded border">
                {activeDiagnoses.length === 0 ? (
                  <span className="text-muted small">No hay diagnósticos activos para este paciente.</span>
                ) : (
                  activeDiagnoses.map(diag => {
                    const isSelected = (draft.diagnosisIds || []).includes(diag.diagnosisId);
                    return (
                      <Badge 
                        key={diag.diagnosisId}
                        bg={isSelected ? 'primary' : 'white'}
                        text={isSelected ? 'white' : 'dark'}
                        className={`border ${isSelected ? 'border-primary' : 'border-secondary'} p-2`}
                        style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                        onClick={() => toggleDiagnosis(diag.diagnosisId)}
                      >
                        {isSelected ? '✓ ' : '+ '}{diag.title}
                      </Badge>
                    );
                  })
                )}
              </div>
              <InputGroup size="sm" className="w-50">
                <Form.Control 
                  placeholder="Nuevo diagnóstico..." 
                  value={newDiagTitle}
                  onChange={(e) => setNewDiagTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateDiagnosis())}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCreateDiagnosis}
                  disabled={isDiagLoading || newDiagTitle.trim().length < 2}
                >
                  {isDiagLoading ? <Spinner size="sm"/> : 'Agregar'}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-medium text-secondary">Evolución de la Sesión *</Form.Label>
              <RichTextEditor 
                content={draft.evolution || ''} 
                onChange={(html) => setDraft(patientId, { evolution: html })}
              />
              <Form.Text className="text-muted">
                Este contenido se guarda automáticamente como borrador mientras escribes.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Accordion className="mb-4">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Campos Adicionales Opcionales</Accordion.Header>
            <Accordion.Body>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-secondary">Resumen de Diagnóstico</Form.Label>
                    <RichTextEditor 
                      content={draft.diagnosisSummary || ''} 
                      onChange={(html) => setDraft(patientId, { diagnosisSummary: html })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-secondary">Observaciones</Form.Label>
                    <RichTextEditor 
                      content={draft.observations || ''} 
                      onChange={(html) => setDraft(patientId, { observations: html })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-secondary">Plan de Tratamiento</Form.Label>
                    <RichTextEditor 
                      content={draft.treatmentPlan || ''} 
                      onChange={(html) => setDraft(patientId, { treatmentPlan: html })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-medium text-secondary">Recomendaciones</Form.Label>
                    <RichTextEditor 
                      content={draft.recommendations || ''} 
                      onChange={(html) => setDraft(patientId, { recommendations: html })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Form>
    </div>
  );
};

export default HistoryEntry
