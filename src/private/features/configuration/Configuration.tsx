import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Spinner, Nav, Tab } from 'react-bootstrap';
import { useConfigStore } from './useConfigStore';
import { useBrand } from '../../../context/BrandContext';
import { toast } from '../../../shared/components/toast/toastManager';

const Configuration: React.FC = () => {
  const { brand, updateBrand, refreshBrand } = useBrand();
  const {
    config,
    isLoading,
    isSaving,
    fetchConfig,
    updateConfig,
    updatePdfConfig,
    saveConfig,
  } = useConfigStore();

  const [activeTab, setActiveTab] = useState<string>('identity');

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveConfig();
    if (ok) {
      await refreshBrand();
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
          updateBrand({ logoUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    updatePdfConfig({ logoUrl: '/medicalLogo.png' });
    updateBrand({ logoUrl: '/medicalLogo.png' });
  };

  const { pdf } = config;
  const institutionName = config.appName || pdf.institutionName || brand.appName || 'Meraki Espacio Integral';
  const shortName = config.shortName || brand.shortName || 'Meraki';
  const legalName = config.legalName || brand.legalName || institutionName;
  const phone = config.phone || brand.phone || '';
  const email = config.email || brand.email || '';
  const address = config.address || brand.address || '';
  const customHeaderNotes = pdf.customHeaderNotes || config.customHeaderNotes || brand.customHeaderNotes || '';

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* Cabecera Principal */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
            ⚙️ Configuración del Sistema
          </h2>
          <p className="text-muted mb-0 small">
            Personaliza la identidad institucional, las opciones de impresión de documentos y las preferencias generales.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="d-flex align-items-center gap-2 px-4 shadow-sm fw-semibold"
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
            <p className="text-muted mb-0">Cargando configuración del sistema...</p>
          </Card.Body>
        </Card>
      ) : (
        <Form onSubmit={handleSave}>
          <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
            {/* Navegación por Pestañas */}
            <Card className="border-0 shadow-sm mb-4 rounded-3">
              <Card.Header className="bg-white border-0 pb-0 pt-3 px-3">
                <Nav variant="pills" className="gap-2">
                  <Nav.Item>
                    <Nav.Link eventKey="identity" className="d-flex align-items-center gap-2 py-2 px-3 fw-semibold">
                      🏢 Identidad y Marca
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="pdf" className="d-flex align-items-center gap-2 py-2 px-3 fw-semibold">
                      📄 Documentos y PDFs
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="general" className="d-flex align-items-center gap-2 py-2 px-3 fw-semibold">
                      ⚙️ General y Sistema
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
            </Card>

            {/* Contenido de las Pestañas */}
            <Tab.Content>
              {/* PESTAÑA 1: IDENTIDAD Y MARCA */}
              <Tab.Pane eventKey="identity">
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-white border-bottom p-3">
                    <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                      🏥 Información Institucional y Marca Blanca
                    </h5>
                    <small className="text-muted">
                      Ajusta el nombre, logo y datos de contacto oficiales que identifican a tu empresa o centro.
                    </small>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-4">
                      <Col md={7}>
                        <Form.Group controlId="institutionName" className="mb-3">
                          <Form.Label className="fw-semibold text-secondary mb-1">
                            Nombre del Centro / Clínica / Aplicación:
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={institutionName}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateConfig({ appName: val });
                              updatePdfConfig({ institutionName: val });
                              updateBrand({ appName: val });
                            }}
                            placeholder="Ej. Espacio Integral Meraki"
                            className="border-primary-subtle"
                          />
                          <Form.Text className="text-muted">
                            Nombre principal que aparecerá en el menú lateral, login y encabezados.
                          </Form.Text>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="shortName" className="mb-3">
                              <Form.Label className="fw-semibold text-secondary mb-1">
                                Nombre Corto:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={shortName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig({ shortName: val });
                                  updateBrand({ shortName: val });
                                }}
                                placeholder="Ej. Meraki"
                                className="border-primary-subtle"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="legalName" className="mb-3">
                              <Form.Label className="fw-semibold text-secondary mb-1">
                                Razón Social / Nombre Legal:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={legalName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig({ legalName: val });
                                  updateBrand({ legalName: val });
                                }}
                                placeholder="Ej. Meraki S.A."
                                className="border-primary-subtle"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="phone" className="mb-3">
                              <Form.Label className="fw-semibold text-secondary mb-1">
                                Teléfono de Contacto:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={phone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig({ phone: val });
                                  updateBrand({ phone: val });
                                }}
                                placeholder="+54 11 1234-5678"
                                className="border-primary-subtle"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="email" className="mb-3">
                              <Form.Label className="fw-semibold text-secondary mb-1">
                                Correo Electrónico Institucional:
                              </Form.Label>
                              <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateConfig({ email: val });
                                  updateBrand({ email: val });
                                }}
                                placeholder="contacto@institucion.com"
                                className="border-primary-subtle"
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group controlId="address" className="mb-3">
                          <Form.Label className="fw-semibold text-secondary mb-1">
                            Dirección Física / Ubicación:
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={address}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateConfig({ address: val });
                              updateBrand({ address: val });
                            }}
                            placeholder="Av. Principal 123, Ciudad"
                            className="border-primary-subtle"
                          />
                        </Form.Group>

                        <Form.Group controlId="logoUpload" className="mb-3">
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

                      {/* Vista Previa */}
                      <Col md={5}>
                        <Card className="bg-light border-dashed p-4 text-center">
                          <small className="text-muted fw-bold d-block mb-3">👁️ Vista Previa del Membrete e Identidad:</small>
                          <div className="p-4 bg-white rounded border d-flex flex-column align-items-center justify-content-center gap-2 shadow-sm">
                            {pdf.logoUrl || brand.logoUrl ? (
                              <img
                                src={pdf.logoUrl || brand.logoUrl || '/medicalLogo.png'}
                                alt="Logo Institucional"
                                style={{ maxHeight: '75px', objectFit: 'contain' }}
                              />
                            ) : (
                              <div className="text-muted small">Sin Logo Configurado</div>
                            )}
                            <div className="fw-bold text-primary h6 mb-0 mt-1">{institutionName}</div>
                            {phone && <div className="text-muted small">📞 {phone}</div>}
                            {email && <div className="text-muted small">✉️ {email}</div>}
                          </div>
                          {(pdf.logoUrl !== '/medicalLogo.png' || brand.logoUrl !== '/medicalLogo.png') && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleResetLogo}
                              className="mt-3 text-nowrap"
                            >
                              Restablecer Logo por Defecto
                            </Button>
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* PESTAÑA 2: DOCUMENTOS Y PDF */}
              <Tab.Pane eventKey="pdf">
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
              </Tab.Pane>

              {/* PESTAÑA 3: GENERAL Y SISTEMA */}
              <Tab.Pane eventKey="general">
                <Card className="border-0 shadow-sm rounded-3">
                  <Card.Header className="bg-white border-bottom p-3">
                    <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                      ⚙️ Preferencias Generales del Sistema
                    </h5>
                    <small className="text-muted">
                      Ajustes globales de rendimiento, formato y almacenamiento local.
                    </small>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="g-4">
                      <Col md={6}>
                        <Card className="p-3 bg-light border">
                          <h6 className="fw-semibold text-primary mb-2">💾 Almacenamiento Local</h6>
                          <p className="text-muted small mb-0">
                            La base de datos SQLite y las imágenes están almacenadas localmente en este equipo para máxima seguridad y privacidad de datos.
                          </p>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="p-3 bg-light border">
                          <h6 className="fw-semibold text-primary mb-2">🔒 Estado del Sistema</h6>
                          <p className="text-muted small mb-0">
                            Aplicación en modo offline / escritorio (Electron). Versión de marca blanca activa.
                          </p>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Form>
      )}
    </Container>
  );
};

export default Configuration;

