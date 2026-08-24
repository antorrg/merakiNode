import { Col, Card, Badge } from 'react-bootstrap'
import { type BrandInfo } from '../../../../../context/BrandContext';
import { type AppConfig, BackupConfig  } from '../../useConfigStore';

type StatusProps = {
    brand: BrandInfo,
    config: AppConfig,
    backup: BackupConfig 
}

const StatusPreview = ({brand, config, backup}:StatusProps) => {
const institutionName = config.appName || brand.appName || 'Meraki Espacio Integral';
  const shortName = config.shortName || brand.shortName || 'Meraki';

  const appSlugPreview = (shortName || institutionName)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'app';
  return (
          <Col md={5}>
            <Card className="bg-light border p-4">
              <h6 className="fw-bold text-primary mb-3">📊 Estado de Copias de Seguridad</h6>

              <div className="mb-3">
                <small className="text-muted fw-semibold d-block">Última copia realizada:</small>
                {backup.lastBackupDate ? (
                  <Badge bg="success" className="px-3 py-2 fs-6 fw-normal mt-1">
                    🟢 {backup.lastBackupDate}
                  </Badge>
                ) : (
                  <Badge bg="warning" text="dark" className="px-3 py-2 fs-6 fw-normal mt-1">
                    ⚠️ Ningún backup registrado aún
                  </Badge>
                )}
              </div>

              <div className="mb-3">
                <small className="text-muted fw-semibold d-block">Formato dinámico del archivo de respaldo:</small>
                <code className="d-block p-2 bg-white rounded border text-dark mt-1 small">
                  {appSlugPreview}_backup_AÑO-MES-DIA.sqlite
                </code>
                <small className="text-muted mt-1 d-block">
                  El nombre del archivo se asigna dinámicamente a partir del nombre de la app/institución.
                </small>
              </div>

              <div className="alert alert-info py-2 px-3 mb-0 small">
                💡 <strong>Resiliencia:</strong> Las copias en caliente se ejecutan mediante la API nativa de SQLite, garantizando que el archivo nunca se corrompa durante el proceso.
              </div>
            </Card>
          </Col>
  )
}

export default StatusPreview
