import React from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useConfigStore } from '../useConfigStore';
import { useBrand } from '../../../../context/useBrand';
import { toast } from '../../../../shared/components/toast/toastManager';
import { DEFAULT_APP_CONFIG } from '../../../../../electron/config.types';

const IdentityTab: React.FC = () => {
  const { brand, updateBrand } = useBrand();
  const { config, updateConfig, updatePdfConfig } = useConfigStore();

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
          updateConfig({ logoUrl: base64 });
          updatePdfConfig({ logoUrl: base64 });
          updateBrand({ logoUrl: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = async () => {
    updateConfig({ logoUrl: null });
    updatePdfConfig({ logoUrl: null });
    await updateBrand({ logoUrl: null });
    await useConfigStore.getState().saveConfig();
  };

  const { pdf } = config;
  const institutionName = config.appName || pdf.institutionName || brand.appName || DEFAULT_APP_CONFIG.appName || '';
  const shortName = config.shortName || brand.shortName || DEFAULT_APP_CONFIG.shortName || '';
  const legalName = config.legalName || brand.legalName || institutionName;
  const phone = config.phone || brand.phone || '';
  const email = config.email || brand.email || '';
  const address = config.address || brand.address || '';

  const displayLogo = (pdf.logoUrl && pdf.logoUrl.startsWith('data:image'))
    ? pdf.logoUrl
    : (config.logoUrl && config.logoUrl.startsWith('data:image'))
      ? config.logoUrl
      : brand.logoUrl;

  const hasCustomLogo = Boolean(
    (config.logoUrl && config.logoUrl !== null && config.logoUrl !== '') ||
    (pdf.logoUrl && pdf.logoUrl !== null && pdf.logoUrl !== '')
  );

  return (
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
                placeholder="Ej. Espacio Medico Integral"
                className="border-primary-subtle"
              />
              <Form.Text className="text-muted">
                Nombre principal que aparecerá en el menú lateral, login y respaldos.
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
                    placeholder="Ej. Medical"
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
                    placeholder="Ej. Espacio Medico Integral S.A."
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
                {displayLogo ? (
                  <img
                    src={displayLogo}
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
              {hasCustomLogo && (
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
  );
};

export default IdentityTab