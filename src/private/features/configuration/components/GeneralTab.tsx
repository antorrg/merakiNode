import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const GeneralTab: React.FC = () => {
  return (
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
                La base de datos SQLite, las copias de seguridad y los registros están almacenados localmente en este equipo para máxima seguridad y privacidad de datos.
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
  );
};
export default GeneralTab