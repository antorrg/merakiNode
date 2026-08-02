import React, { useState } from 'react';
import { Modal, Button, Form, Card, Row, Col, Badge, Accordion, Spinner } from 'react-bootstrap';
import { useHistoryPdfStore } from './useHistoryPdfStore';
import { useAuth } from '../../../context/AuthContext';
import { IPatient, VisitType } from '../../../types';
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor';
import { adminApi } from '../../../shared/api/api';
import { toast } from '../../../shared/components/toast/toastManager';
import './HistoryPdfExportModal.css';

interface HistoryPdfExportModalProps {
  patient: IPatient | null;
}

const getVisitTypeLabel = (type: string): string => {
  switch (type) {
    case VisitType.PRESENTIAL:
    case 'PRESENTIAL':
      return 'Presencial';
    case VisitType.VIRTUAL:
    case 'VIRTUAL':
      return 'Virtual';
    case VisitType.PHONE:
    case 'PHONE':
      return 'Telefónica';
    case VisitType.REPORT:
    case 'REPORT':
      return 'Reporte';
    default:
      return type || 'Presencial';
  }
};

const getVisitTypeBadgeVariant = (type: string): string => {
  switch (type) {
    case VisitType.PRESENTIAL:
    case 'PRESENTIAL':
      return 'primary';
    case VisitType.VIRTUAL:
    case 'VIRTUAL':
      return 'info';
    case VisitType.PHONE:
    case 'PHONE':
      return 'warning';
    case VisitType.REPORT:
    case 'REPORT':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const HistoryPdfExportModal: React.FC<HistoryPdfExportModalProps> = ({ patient }) => {
  const { user } = useAuth();
  const {
    isModalOpen,
    closeExportModal,
    draftEntries,
    updateDraftEntryField,
    pdfConfig,
    updatePdfConfig,
  } = useHistoryPdfStore();

  const [isGenerating, setIsGenerating] = useState(false);

  if (!isModalOpen) return null;

  const todayDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = async () => {
    if (!patient) {
      toast.error('No se seleccionó información del paciente');
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        patientId: patient.patientId,
        patientData: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          typeDoc: patient.typeDoc,
          identityCode: patient.identityCode,
          birthDate: patient.birthDate,
          age: patient.age,
          phone: patient.phone || patient.ownPhone,
          email: patient.email || patient.ownEmail,
          address: patient.address,
          city: patient.city,
          postalCode: patient.postalCode,
          guardians: patient.guardians?.map((g) => ({
            name: g.name,
            relationship: g.relationship,
          })),
        },
        professionalData: {
          userName: user?.userName || user?.nickname || 'Dr. Profesional',
          userEmail: user?.userEmail || 'N/A',
          role: user?.role,
        },
        pdfConfig,
        draftEntries,
      };

      const response = await adminApi.execute<{
        success: boolean;
        filePath: string;
        userChosenPath?: string;
      }>({
        request: { channel: 'pdf:generate', payload },
        hasMessage: true,
        successMessage: 'Reporte PDF generado y guardado en la base de datos con éxito',
        reject: (err: unknown) => {
          throw err;
        },
      });

      if (response?.success) {
        closeExportModal();
      }
    } catch (err: any) { //eslint-disable-line
      toast.error(err?.message || 'Error al generar la copia en PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const patientGuardians = patient?.guardians || [];
  const fullAddress = [patient?.address, patient?.city, patient?.postalCode]
    .filter(Boolean)
    .join(', ');

  return (
    <Modal
      show={isModalOpen}
      onHide={closeExportModal}
      dialogClassName="pdf-export-modal-dialog"
      scrollable
      centered
      className="pdf-export-modal"
    >
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="h5 text-primary mb-0 d-flex align-items-center gap-2">
          📄 Previsualización y Edición de Borrador para PDF
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light-subtle">
        {/* Encabezado del Documento con vista previa y reservado para Logo */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-start">
              {/* Sección Logo / Membrete */}
              <Col md={3} className="text-center border-end pe-3 mb-3 mb-md-0 d-flex flex-column align-items-center justify-content-center">
                {pdfConfig.logoUrl ? (
                  <div className="text-center p-2">
                    <img
                      src={pdfConfig.logoUrl}
                      alt="Logo Meraki"
                      className="img-fluid mb-1"
                      style={{ maxHeight: '75px', objectFit: 'contain' }}
                    />
                    <div className="fw-bold text-primary small tracking-wider">MERAKI</div>
                  </div>
                ) : (
                  <div
                    className="p-3 bg-light rounded text-muted border border-dashed text-center"
                    style={{ fontSize: '0.85rem' }}
                  >
                    🏥 <strong>Espacio para Logo / Imagen</strong>
                  </div>
                )}
              </Col>

              {/* Datos Completos del Profesional y del Paciente */}
              <Col md={9}>
                <Row className="gy-3">
                  <Col md={4} className="border-end pe-3">
                    <h6 className="text-primary mb-2 fw-bold d-flex align-items-center gap-1">
                      👨‍⚕️ Datos del Profesional
                    </h6>
                    <p className="mb-1 text-dark small">
                      <strong>Nombre:</strong> {user?.userName || user?.nickname || 'Dr. Profesional'}
                    </p>
                    <p className="mb-1 text-muted small">
                      <strong>Email:</strong> {user?.userEmail || 'N/A'}
                    </p>
                    <p className="mb-0 text-muted small">
                      <strong>Rol:</strong> {user?.role || 'PROFESIONAL'}
                    </p>
                  </Col>

                  <Col md={8}>
                    <h6 className="text-primary mb-2 fw-bold d-flex align-items-center gap-1">
                      👤 Datos Completos del Paciente
                    </h6>
                    <Row className="g-2 small text-dark">
                      <Col sm={6}>
                        <strong>Nombre Completo:</strong>{' '}
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'N/A'}
                      </Col>
                      <Col sm={6}>
                        <strong>{patient?.typeDoc || 'Documento'}:</strong> {patient?.identityCode || 'N/A'}
                      </Col>
                      <Col sm={6}>
                        <strong>Fecha de Nacimiento:</strong> {patient?.birthDate || 'N/A'}{' '}
                        {patient?.age !== undefined && `(${patient.age} años)`}
                      </Col>
                      <Col sm={6}>
                        <strong>Teléfono:</strong> {patient?.phone || patient?.ownPhone || 'Sin registrar'}
                      </Col>
                      <Col sm={6}>
                        <strong>Correo Electrónico:</strong> {patient?.email || patient?.ownEmail || 'Sin registrar'}
                      </Col>
                      <Col sm={6}>
                        <strong>Domicilio:</strong> {fullAddress || 'Sin registrar'}
                      </Col>
                      {patientGuardians.length > 0 && (
                        <Col sm={12} className="text-secondary">
                          <strong>Tutor(es) / Responsable(s):</strong>{' '}
                          {patientGuardians
                            .map((g) => `${g.name}${g.relationship ? ` (${g.relationship})` : ''}`)
                            .join(', ')}
                        </Col>
                      )}
                    </Row>
                  </Col>

                  <Col md={12} className="pt-2 border-top mt-2 d-flex justify-content-between text-muted small">
                    <span>
                      📅 <strong>Fecha de Emisión:</strong> {todayDate}
                    </span>
                    <span>
                      📌 <strong>Visitas registradas a incluir:</strong> {draftEntries.length}
                    </span>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Panel de Configuración Estilos y Visibilidad */}
        <Accordion defaultActiveKey="0" className="mb-4 shadow-sm">
          <Accordion.Item eventKey="0">
            <Accordion.Header>⚙️ Opciones de Configuración y Visibilidad del PDF</Accordion.Header>
            <Accordion.Body className="bg-white">
              <Row className="g-3">
                <Col md={3}>
                  <Form.Check
                    type="switch"
                    id="show-linked-diag"
                    label="Incluir Diagnósticos del Paciente"
                    checked={pdfConfig.showLinkedDiagnoses}
                    onChange={(e) => updatePdfConfig({ showLinkedDiagnoses: e.target.checked })}
                  />
                </Col>
                <Col md={3}>
                  <Form.Check
                    type="switch"
                    id="show-diag-summary"
                    label="Incluir Resumen de Diagnóstico"
                    checked={pdfConfig.showDiagnosisSummary}
                    onChange={(e) => updatePdfConfig({ showDiagnosisSummary: e.target.checked })}
                  />
                </Col>
                <Col md={2}>
                  <Form.Check
                    type="switch"
                    id="show-obs"
                    label="Incluir Observaciones"
                    checked={pdfConfig.showObservations}
                    onChange={(e) => updatePdfConfig({ showObservations: e.target.checked })}
                  />
                </Col>
                <Col md={2}>
                  <Form.Check
                    type="switch"
                    id="show-treat"
                    label="Incluir Plan Tratamiento"
                    checked={pdfConfig.showTreatmentPlan}
                    onChange={(e) => updatePdfConfig({ showTreatmentPlan: e.target.checked })}
                  />
                </Col>
                <Col md={2}>
                  <Form.Check
                    type="switch"
                    id="show-recom"
                    label="Incluir Recomendaciones"
                    checked={pdfConfig.showRecommendations}
                    onChange={(e) => updatePdfConfig({ showRecommendations: e.target.checked })}
                  />
                </Col>
                <Col md={12} className="pt-2 border-top">
                  <Form.Group controlId="customHeaderNotes">
                    <Form.Label className="small text-muted mb-1">Notas o Aclaración Inicial para el PDF (Opcional):</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Ej: Informe médico emitido a solicitud del paciente para trámites personales."
                      value={pdfConfig.customHeaderNotes}
                      onChange={(e) => updatePdfConfig({ customHeaderNotes: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        {/* Sección de Entradas del Borrador Editable */}
        <h6 className="text-secondary fw-bold mb-3 d-flex align-items-center justify-content-between">
          <span>✏️ Edición del PDF (No altera los datos guardados)</span>
          <span className="badge bg-secondary">{draftEntries.length} Entradas</span>
        </h6>

        {draftEntries.length === 0 ? (
          <div className="p-4 text-center text-muted bg-white rounded border">
            No se han seleccionado visitas para incluir en el reporte.
          </div>
        ) : (
          draftEntries.map((entry) => {//eslint-disable-line
            const formattedVisitDate = new Date(entry.visitDate).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card key={entry.entryId} className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-2">
                  <div>
                    <strong className="text-primary">Visita día {formattedVisitDate}</strong>
                  </div>
                  <Badge bg={getVisitTypeBadgeVariant(entry.visitType)}>
                    {getVisitTypeLabel(entry.visitType)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {/* Motivo de consulta */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary small mb-1">Motivo de Consulta:</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      value={entry.reason}
                      onChange={(e) => updateDraftEntryField(entry.entryId, 'reason', e.target.value)}
                    />
                  </Form.Group>

                  {/* Evolución con Editor TipTap */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary small mb-1">Evolución:</Form.Label>
                    <RichTextEditor
                      content={entry.evolution}
                      onChange={(html) => updateDraftEntryField(entry.entryId, 'evolution', html)}
                    />
                  </Form.Group>

                  {/* Diagnósticos del Paciente / Asociados si está activo */}
                  {pdfConfig.showLinkedDiagnoses && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary small mb-1">Diagnósticos Asociados del Paciente:</Form.Label>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Ej: Hipertensión Arterial (ACTIVO), Diabetes Mellitus (CRÓNICO)"
                        value={entry.linkedDiagnosesText}
                        onChange={(e) => updateDraftEntryField(entry.entryId, 'linkedDiagnosesText', e.target.value)}
                      />
                    </Form.Group>
                  )}

                  {/* Resumen de Diagnóstico con Editor TipTap si está activo */}
                  {pdfConfig.showDiagnosisSummary && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary small mb-1">Resumen de Diagnóstico (TipTap):</Form.Label>
                      <RichTextEditor
                        content={entry.diagnosisSummary}
                        onChange={(html) => updateDraftEntryField(entry.entryId, 'diagnosisSummary', html)}
                      />
                    </Form.Group>
                  )}

                  {/* Observaciones con Editor TipTap si están activas */}
                  {pdfConfig.showObservations && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary small mb-1">Observaciones:</Form.Label>
                      <RichTextEditor
                        content={entry.observations}
                        onChange={(html) => updateDraftEntryField(entry.entryId, 'observations', html)}
                      />
                    </Form.Group>
                  )}

                  {/* Plan de tratamiento con Editor TipTap si está activo */}
                  {pdfConfig.showTreatmentPlan && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary small mb-1">Plan de Tratamiento:</Form.Label>
                      <RichTextEditor
                        content={entry.treatmentPlan}
                        onChange={(html) => updateDraftEntryField(entry.entryId, 'treatmentPlan', html)}
                      />
                    </Form.Group>
                  )}

                  {/* Recomendaciones con Editor TipTap si están activas */}
                  {pdfConfig.showRecommendations && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary small mb-1">Recomendaciones:</Form.Label>
                      <RichTextEditor
                        content={entry.recommendations}
                        onChange={(html) => updateDraftEntryField(entry.entryId, 'recommendations', html)}
                      />
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
            );
          })
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light border-top d-flex justify-content-between">
        <span className="text-muted small">
          ℹ️ Los cambios realizados en este formulario no afectan las historias guardadas del paciente.
        </span>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={closeExportModal} disabled={isGenerating}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={draftEntries.length === 0 || isGenerating}
            className="d-flex align-items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Spinner animation="border" size="sm" /> Generando PDF...
              </>
            ) : (
              '🖨️ Exportar a PDF'
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
