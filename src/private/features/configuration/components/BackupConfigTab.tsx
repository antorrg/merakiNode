import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';
import { useConfigStore } from '../useConfigStore';
import { useBrand } from '../../../../context/BrandContext';
import { toast } from '../../../../shared/components/toast/toastManager';
import StatusPreview from './BackupComponents/StatusPreview';
import BackupButtons from './BackupComponents/BackupButtons';

const BackupConfigTab: React.FC = () => {
  const { brand } = useBrand();
  const {
    config,
    isLoading,
    isPerformingBackup,
    isPerformingMaintenance,
    updateBackupConfig,
    triggerManualBackup,
    triggerMaintenance,
  } = useConfigStore();

  const handleManualBackup = async () => {
    toast.info('Creando copia de seguridad...');
    const result = await triggerManualBackup();
    if (result.success) {
      toast.success(`Copia de seguridad creada correctamente: ${result.path || ''}`);
    } else {
      toast.error('Error al crear la copia de seguridad');
    }
  };

  const handleManualMaintenance = async () => {
    toast.info('Ejecutando mantenimiento de la base de datos...');
    const result = await triggerMaintenance();
    if (result.success) {
      toast.success(`Mantenimiento completado. Registros de logs purgados: ${result.logsDeleted || 0}. Espacio optimizado.`);
    } else {
      toast.error('Error al ejecutar el mantenimiento');
    }
  };

  const { backup } = config;

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom p-3">
        <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
          💾 Copias de Seguridad de la Base de Datos
        </h5>
        <small className="text-muted">
          Configura la frecuencia de los respaldos automáticos en caliente y la política de conservación de datos.
        </small>
      </Card.Header>
      <Card.Body className="p-4">
        <Row className="g-4">
          <Col md={7}>
            {/* Habilitar Backup Automático */}
            <div className="bg-light p-3 rounded border mb-4">
              <Form.Check
                type="switch"
                id="backup-enabled-switch"
                label={
                  <span className="fw-bold text-dark">
                    Habilitar copias de seguridad automáticas al iniciar la aplicación
                  </span>
                }

                checked={backup.enabled}
                onChange={(e) => updateBackupConfig({ enabled: e.target.checked })}
              />
              <small className="text-muted d-block mt-1 ms-4">
                Se creará una copia de respaldo en caliente sin interrumpir el uso de la aplicación según la frecuencia indicada.
              </small>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="backupFrequency" className="mb-3">
                  <Form.Label className="fw-semibold text-secondary mb-1">
                    📅 Frecuencia de Respaldo:
                  </Form.Label>
                  <Form.Select
                    value={backup.frequencyDays}
                    disabled={!backup.enabled}
                    onChange={(e) =>
                      updateBackupConfig({ frequencyDays: Number(e.target.value) })
                    }
                    className="border-primary-subtle"
                  >
                    <option value={1}>Diario (cada 1 día)</option>
                    <option value={2}>Cada 2 días</option>
                    <option value={3}>Cada 3 días</option>
                    <option value={5}>Cada 5 días</option>
                    <option value={7}>Semanal (cada 7 días)</option>
                    <option value={14}>Quincenal (cada 14 días)</option>
                    <option value={30}>Mensual (cada 30 días)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Adaptable según el flujo de trabajo del profesional.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="backupRetention" className="mb-3">
                  <Form.Label className="fw-semibold text-secondary mb-1">
                    📦 Retención Máxima de Archivos:
                  </Form.Label>
                  <Form.Select
                    value={backup.maxRetentionFiles}
                    disabled={!backup.enabled}
                    onChange={(e) =>
                      updateBackupConfig({ maxRetentionFiles: Number(e.target.value) })
                    }
                    className="border-primary-subtle"
                  >
                    <option value={5}>Conservar últimos 5 respaldos</option>
                    <option value={10}>Conservar últimos 10 respaldos (Recomendado)</option>
                    <option value={15}>Conservar últimos 15 respaldos</option>
                    <option value={30}>Conservar últimos 30 respaldos</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Los respaldos excedentes se eliminarán automáticamente.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />
            <h6 className="fw-bold text-dark mb-3">⚡ Acciones de Mantenimiento Manual:</h6>
            <BackupButtons
                handleClickBackup = {handleManualBackup}
                isPerformingBackup = {isPerformingBackup}
                handleClickMaintenance = {handleManualMaintenance}
                isPerformingMaintenance = {isPerformingMaintenance}
                isLoading = {isLoading}
            />
          </Col>
          <StatusPreview 
          brand= {brand}
          config = {config} 
          backup = {backup}
          />
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BackupConfigTab
