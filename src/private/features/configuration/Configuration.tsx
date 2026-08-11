import React, { useEffect } from 'react';
import { Container, Card, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useConfigStore } from './useConfigStore';
import { toast } from '../../../shared/components/toast/toastManager';

const Configuration: React.FC = () => {
  const {
    config,
    isLoading,
    isSaving,
    fetchConfig,
    updateConfig,
    updatePdfConfig,
    saveConfig,
  } = useConfigStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveConfig();
    if (ok) {
      toast.success('Configuración guardada correctamente');
    } else {
      toast.error('Error al guardar la configuración');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 2 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          updatePdfConfig({ logoUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    updatePdfConfig({ logoUrl: '/medicalLogo.png' });
  };

  const { pdf } = config;
  const institutionName = pdf.institutionName || config.appName || 'Meraki Espacio Integral';

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
            ⚙️ Configuración del Sistema
          </h2>
          <p className="text-muted mb-0 small">
            Personaliza el comportamiento global de la aplicación, el membrete de la institución y las opciones de impresión.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="d-flex align-items-center gap-2 px-4 shadow-sm"
        >
          {isSaving ? (
            <>
              <Spinner animation="border" size="sm" />
              Guardando...
            </>
          ) : (
            <>💾 Guardar Cambios</>
          )}
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-0 shadow-sm p-5 text-center">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Cargando configuración...</p>
          </Card.Body>
        </Card>
      ) : (
        <Form onSubmit={handleSave}>
          <Row className="g-4">
            {/* Sección Identidad Institucional */}
            <Col md={12}>
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom p-3">
                  <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    🏥 Identidad de la Institución
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4 align-items-center">
                    <Col md={7}>
                      <Form.Group controlId="institutionName" className="mb-3">
                        <Form.Label className="fw-semibold text-secondary mb-1">
                          Nombre del Centro / Clínica / Institución:
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={institutionName}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig({ appName: val });
                            updatePdfConfig({ institutionName: val });
                          }}
                          placeholder="Ej. Meraki Espacio Integral"
                          className="border-primary-subtle"
                        />
                        <Form.Text className="text-muted">
                          Este nombre aparecerá en el menú lateral, la pantalla principal y el encabezado de los documentos PDF.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group controlId="logoUpload">
                        <Form.Label className="fw-semibold text-secondary mb-1">
                          Subir Logo de la Institución:
                        </Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleLogoUpload}
                          className="border-primary-subtle"
                        />
                        <Form.Text className="text-muted d-block mt-1">
                          Formatos aceptados: PNG, JPG, WEBP. Tamaño máximo: 2 MB.
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Previsualización del Logo e Identidad */}
                    <Col md={5}>
                      <Card className="bg-light border-dashed p-3 text-center">
                        <small className="text-muted fw-bold d-block mb-2">👁️ Vista Previa del Membrete:</small>
                        <div className="p-3 bg-white rounded border d-flex flex-column align-items-center justify-content-center gap-2">
                          {pdf.logoUrl ? (
                            <img
                              src={pdf.logoUrl}
                              alt="Logo Institucional"
                              style={{ maxHeight: '65px', objectFit: 'contain' }}
                            />
                          ) : (
                            <div className="text-muted small">Sin Logo Configurado</div>
                          )}
                          <div className="fw-bold text-primary small mt-1">{institutionName}</div>
                        </div>
                        {pdf.logoUrl !== '/medicalLogo.png' && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleResetLogo}
                            className="mt-2 text-nowrap"
                          >
                            Restablecer Logo por Defecto
                          </Button>
                        )}
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Sección PDF */}
            <Col md={12}>
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Header className="bg-white border-bottom p-3">
                  <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                    📄 Exportación e Impresión a PDF
                  </h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-4">
                    {/* Tamaños de Fuente */}
                    <Col md={6}>
                      <Form.Group controlId="pdfFontSize" className="mb-3">
                        <Form.Label className="fw-semibold text-secondary mb-1">
                          🔤 Tamaño de Fuente para el Documento PDF:
                        </Form.Label>
                        <Form.Select
                          value={pdf.fontSize}
                          onChange={(e) =>
                            updatePdfConfig({ fontSize: e.target.value as 'sm' | 'md' | 'lg' })
                          }
                          className="form-select-sm border-primary-subtle"
                        >
                          <option value="sm">Pequeño (12px / ~9pt en papel impreso)</option>
                          <option value="md">Normal / Estándar (14px / ~10.5pt en papel impreso)</option>
                          <option value="lg">Grande (16px / ~12pt en papel impreso)</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Ajusta la escala general de las letras en las impresiones de Historias Clínicas.
                        </Form.Text>
                      </Form.Group>

                      {/* Vista Previa en Vivo */}
                      <Card className="bg-light border-dashed p-3">
                        <small className="text-muted fw-bold d-block mb-2">👁️ Vista Previa del Tamaño de Letra:</small>
                        <div
                          style={{
                            fontSize:
                              pdf.fontSize === 'sm' ? '12px' : pdf.fontSize === 'lg' ? '16px' : '14px',
                            lineHeight: '1.4',
                          }}
                          className="p-2 bg-white rounded border text-dark"
                        >
                          <strong>Visita día 11 de agosto de 2026:</strong> Paciente presenta evolución favorable. Se mantiene tratamiento indicado y recomendaciones generales.
                        </div>
                      </Card>
                    </Col>

                    {/* Visibilidad por Defecto */}
                    <Col md={6}>
                      <h6 className="fw-semibold text-secondary mb-3">
                        👁️ Secciones Incluidas por Defecto al Exportar:
                      </h6>
                      <div className="d-flex flex-column gap-3 bg-light p-3 rounded border">
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
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
};

export default Configuration;

