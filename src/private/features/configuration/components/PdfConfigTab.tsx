import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useConfigStore } from '../useConfigStore';
import { useBrand } from '../../../../context/BrandContext';


const PdfConfigTab: React.FC = () => {
  const { brand, updateBrand } = useBrand();
  const { config, updateConfig, updatePdfConfig } = useConfigStore();

  const { pdf } = config;
  const customHeaderNotes = pdf.customHeaderNotes || config.customHeaderNotes || brand.customHeaderNotes || '';

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom p-3">
        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          📄 Preferencias de Exportación e Impresión en PDF
        </h5>
        <small className="text-muted">
          Configura el formato por defecto de las Historias Clínicas impresas y descargadas.
        </small>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-4">
          {/* Tamaño de Fuente y Notas */}
          <Col md={6}>
            <Form.Group controlId="pdfFontSize" className="mb-4">
              <Form.Label className="fw-semibold text-secondary mb-1">
                🔤 Tamaño de Fuente para el Documento PDF:
              </Form.Label>
              <Form.Select
                value={pdf.fontSize}
                onChange={(e) =>
                  updatePdfConfig({ fontSize: e.target.value as 'sm' | 'md' | 'lg' })
                }
                className="border-primary-subtle"
              >
                <option value="sm">Pequeño (12px / ~9pt en papel impreso)</option>
                <option value="md">Normal / Estándar (14px / ~10.5pt en papel impreso)</option>
                <option value="lg">Grande (16px / ~12pt en papel impreso)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Ajusta la escala general de las letras en las impresiones de Historias Clínicas.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="customHeaderNotes" className="mb-4">
              <Form.Label className="fw-semibold text-secondary mb-1">
                📝 Notas del Pie de Página / Aclaraciones:
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={customHeaderNotes}
                onChange={(e) => {
                  const val = e.target.value;
                  updatePdfConfig({ customHeaderNotes: val });
                  updateConfig({ customHeaderNotes: val });
                  updateBrand({ customHeaderNotes: val });
                }}
                placeholder="Ej. Documento confidencial de uso estrictamente médico."
                className="border-primary-subtle"
              />
            </Form.Group>

            {/* Vista Previa de Letra */}
            <Card className="bg-light border-dashed p-3">
              <small className="text-muted fw-bold d-block mb-2">👁️ Vista Previa del Tamaño de Letra:</small>
              <div
                style={{
                  fontSize:
                    pdf.fontSize === 'sm' ? '12px' : pdf.fontSize === 'lg' ? '16px' : '14px',
                  lineHeight: '1.4',
                }}
                className="p-3 bg-white rounded border text-dark shadow-sm"
              >
                <strong>Visita clínica:</strong> Paciente presenta evolución favorable. Se mantiene tratamiento indicado.
              </div>
            </Card>
          </Col>

          {/* Visibilidad de Secciones */}
          <Col md={6}>
            <h6 className="fw-semibold text-secondary mb-3">
              👁️ Secciones Incluidas por Defecto al Exportar:
            </h6>
            <div className="d-flex flex-column gap-3 bg-light p-4 rounded border">
              <Form.Check
                type="switch"
                id="cfg-show-linked"
                label="Incluir Diagnósticos del Paciente por defecto"
                checked={pdf.showLinkedDiagnoses}
                onChange={(e) => updatePdfConfig({ showLinkedDiagnoses: e.target.checked })}
              />
              <Form.Check
                type="switch"
                id="cfg-show-diag-summary"
                label="Incluir Resumen de Diagnósticos por defecto"
                checked={pdf.showDiagnosisSummary}
                onChange={(e) => updatePdfConfig({ showDiagnosisSummary: e.target.checked })}
              />
              <Form.Check
                type="switch"
                id="cfg-show-obs"
                label="Incluir Observaciones por defecto"
                checked={pdf.showObservations}
                onChange={(e) => updatePdfConfig({ showObservations: e.target.checked })}
              />
              <Form.Check
                type="switch"
                id="cfg-show-treat"
                label="Incluir Plan de Tratamiento por defecto"
                checked={pdf.showTreatmentPlan}
                onChange={(e) => updatePdfConfig({ showTreatmentPlan: e.target.checked })}
              />
              <Form.Check
                type="switch"
                id="cfg-show-recom"
                label="Incluir Recomendaciones por defecto"
                checked={pdf.showRecommendations}
                onChange={(e) => updatePdfConfig({ showRecommendations: e.target.checked })}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PdfConfigTab