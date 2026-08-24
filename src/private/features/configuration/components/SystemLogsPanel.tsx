import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Badge, Form, Button, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { adminApi } from '../../../../shared/api/api';
import { toast } from '../../../../shared/components/toast/toastManager';

export interface SystemLog {
  id: number;
  levelName: string;
  levelCode: number;
  message: string;
  type: string | null;
  status: number | null;
  stack: string | null;
  contexts: unknown[];
  pid: number;
  time: number;
  hostname: string;
  keep: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedLogsResponse {
  info: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  results: SystemLog[];
}

const SystemLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modales
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<SystemLog | null>(null);
  const [logToToggleKeep, setLogToToggleKeep] = useState<{ log: SystemLog; targetKeep: boolean } | null>(null);
  const [logToDelete, setLogToDelete] = useState<SystemLog | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);

  const fetchLogs = useCallback(async (targetPage: number = page) => {
    setIsLoading(true);
    try {
      const res = await adminApi.execute<PaginatedLogsResponse>({
        request: {
          channel: 'logs.getAll',
          payload: { page: targetPage, limit, sortBy: 'id', order: 'DESC' },
        },
      });

      if (res && res.results) {
        setLogs(res.results);
        setTotal(res.info.total);
        setTotalPages(res.info.totalPages || 1);
        setPage(res.info.page);
      }
    } catch (err) {
      console.error('Error al obtener registros de log:', err);
      toast.error('Error al cargar los registros del sistema');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  // Manejo de Toggle Keep (Guardar)
  const handleConfirmToggleKeep = async () => {
    if (!logToToggleKeep) return;
    const { log, targetKeep } = logToToggleKeep;

    try {
      await adminApi.execute({
        request: {
          channel: 'logs.update',
          payload: { id: log.id, data: { keep: targetKeep } },
        },
      });
      toast.success('Log actualizado correctamente');
      fetchLogs(page);
    } catch (err) {
      console.error('Error al actualizar log:', err);
      toast.error('No se pudo actualizar el registro');
    } finally {
      setLogToToggleKeep(null);
    }
  };

  // Manejo de Eliminar Log Individual
  const handleConfirmDeleteSingle = async () => {
    if (!logToDelete) return;
    try {
      await adminApi.execute({
        request: {
          channel: 'logs.delete',
          payload: { id: logToDelete.id },
        },
      });
      toast.success('Registro eliminado correctamente');
      fetchLogs(page);
    } catch (err) {
      console.error('Error al eliminar log:', err);
      toast.error('No se pudo eliminar el registro');
    } finally {
      setLogToDelete(null);
    }
  };

  // Manejo de Eliminar Todos los logs no guardados
  const handleConfirmDeleteAll = async () => {
    try {
      await adminApi.execute({
        request: {
          channel: 'logs.deleteAll',
          payload: {},
        },
      });
      toast.success('Registros no protegidos eliminados correctamente');
      fetchLogs(1);
    } catch (err) {
      console.error('Error al eliminar todos los logs:', err);
      toast.error('No se pudieron eliminar los registros');
    } finally {
      setShowDeleteAllModal(false);
    }
  };

  const formatTimestamp = (timeMs: number, createdAtStr?: string): string => {
    if (timeMs && timeMs > 0) {
      const date = new Date(timeMs);
      return date.toLocaleString();
    }
    if (createdAtStr) {
      return new Date(createdAtStr).toLocaleString();
    }
    return 'Fecha no disponible';
  };

  const getLevelBadgeVariant = (levelName: string) => {
    const lower = (levelName || '').toLowerCase();
    if (lower.includes('error') || lower.includes('fatal')) return 'danger';
    if (lower.includes('warn')) return 'warning';
    if (lower.includes('info')) return 'info';
    return 'secondary';
  };

  return (
    <Card className="border-0 shadow-sm rounded-3">
      <Card.Header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between">
        <div>
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            📜 Registros del Sistema (Logs)
          </h5>
          <small className="text-muted">
            Inspecciona el historial de eventos, errores y auditoría del servidor SQLite.
          </small>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteAllModal(true)}
          disabled={isLoading || logs.length === 0}
          className="d-flex align-items-center gap-2 shadow-sm fw-semibold"
        >
          🗑️ Eliminar Todos
        </Button>
      </Card.Header>

      <Card.Body className="p-0">
        {isLoading && logs.length === 0 ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Cargando registros del sistema...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <p className="mb-0">No hay registros de log guardados actualmente en la base de datos.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="bg-dark text-white border-bottom">
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th style={{ width: '100px' }}>Nivel</th>
                  <th style={{ width: '180px' }}>Fecha</th>
                  <th style={{ width: '100px' }} className="text-center">Guardar</th>
                  <th>Mensaje</th>
                  <th style={{ width: '160px' }} className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="fw-bold text-secondary">#{log.id}</td>
                    <td>
                      <Badge bg={getLevelBadgeVariant(log.levelName)} className="px-2 py-1">
                        {log.levelName}
                      </Badge>
                    </td>
                    <td className="small text-muted">
                      {formatTimestamp(log.time, log.createdAt)}
                    </td>
                    <td className="text-center">
                      <Form.Check
                        type="switch"
                        id={`keep-switch-${log.id}`}
                        checked={log.keep}
                        onChange={(e) =>
                          setLogToToggleKeep({ log, targetKeep: e.target.checked })
                        }
                      />
                    </td>
                    <td style={{ maxWidth: '400px' }} className="text-truncate">
                      {log.message}
                    </td>
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setSelectedLogForDetail(log)}
                          className="d-flex align-items-center gap-1 py-1 px-2"
                        >
                          👁️ Detalles
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setLogToDelete(log)}
                          className="d-flex align-items-center gap-1 py-1 px-2"
                          title="Eliminar registro"
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Footer Paginado */}
      <Card.Footer className="bg-white border-top p-3 d-flex align-items-center justify-content-between">
        <span className="small text-muted">
          Página <strong>{page}</strong> de <strong>{totalPages}</strong> (Total: {total} registros)
        </span>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            ◀ Anterior
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Siguiente ▶
          </Button>
        </div>
      </Card.Footer>

      {/* MODAL 1: PROTEGER / DESMARCAR LOG */}
      <Modal show={!!logToToggleKeep} onHide={() => setLogToToggleKeep(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">
            {logToToggleKeep?.targetKeep ? '🔒 ¿Proteger registro?' : '🔓 ¿Desmarcar registro?'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="mb-0 fs-6 text-dark">
            {logToToggleKeep?.targetKeep
              ? 'No será eliminado en limpiezas masivas ni mantenimientos automáticos.'
              : 'Podrá ser eliminado en limpiezas masivas y mantenimientos automáticos.'}
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center gap-2 border-0 pt-0">
          <Button variant="primary" onClick={handleConfirmToggleKeep} className="px-4">
            Sí
          </Button>
          <Button variant="secondary" onClick={() => setLogToToggleKeep(null)} className="px-4">
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL 2: DETALLES DEL REGISTRO */}
      <Modal
        show={!!selectedLogForDetail}
        onHide={() => setSelectedLogForDetail(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title className="h5 fw-bold d-flex align-items-center gap-2">
            📋 Detalles del Registro #{selectedLogForDetail?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          {selectedLogForDetail && (
            <div>
              <Row className="mb-3 g-2">
                <Col md={6}>
                  <small className="text-muted d-block">Nivel:</small>
                  <Badge bg={getLevelBadgeVariant(selectedLogForDetail.levelName)} className="fs-6">
                    {selectedLogForDetail.levelName} (Código {selectedLogForDetail.levelCode})
                  </Badge>
                </Col>
                <Col md={6}>
                  <small className="text-muted d-block">Fecha y Hora:</small>
                  <strong className="text-dark">
                    {formatTimestamp(selectedLogForDetail.time, selectedLogForDetail.createdAt)}
                  </strong>
                </Col>
                <Col md={4} className="mt-2">
                  <small className="text-muted d-block">PID Procesador:</small>
                  <span className="font-monospace text-dark">{selectedLogForDetail.pid}</span>
                </Col>
                <Col md={4} className="mt-2">
                  <small className="text-muted d-block">Hostname:</small>
                  <span className="font-monospace text-dark">{selectedLogForDetail.hostname || 'Local'}</span>
                </Col>
                {selectedLogForDetail.type && (
                  <Col md={4} className="mt-2">
                    <small className="text-muted d-block">Tipo de Error:</small>
                    <Badge bg="danger">{selectedLogForDetail.type}</Badge>
                  </Col>
                )}
                {selectedLogForDetail.status && (
                  <Col md={4} className="mt-2">
                    <small className="text-muted d-block">Estado HTTP:</small>
                    <Badge bg="secondary">{selectedLogForDetail.status}</Badge>
                  </Col>
                )}
              </Row>

              {/* Mensaje Principal */}
              <div className="mb-3">
                <small className="text-muted fw-bold d-block mb-1">Mensaje Principal:</small>
                <div className="p-3 bg-white border rounded text-dark fw-semibold">
                  {selectedLogForDetail.message}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedLogForDetail.stack && (
                <div className="mb-3">
                  <small className="text-muted fw-bold d-block mb-1">Stack Trace (Traza de Pila):</small>
                  <pre
                    className="p-3 bg-dark text-danger rounded border font-monospace small mb-0"
                    style={{ maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}
                  >
                    {selectedLogForDetail.stack}
                  </pre>
                </div>
              )}

              {/* Contenidos Adicionales / Contextos */}
              {selectedLogForDetail.contexts && selectedLogForDetail.contexts.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted fw-bold d-block mb-1">Contenidos Adicionales / Contextos:</small>
                  <pre
                    className="p-3 bg-white border rounded font-monospace small mb-0 text-dark"
                    style={{ maxHeight: '150px', overflowY: 'auto' }}
                  >
                    {JSON.stringify(selectedLogForDetail.contexts, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light border-top">
          <Button variant="secondary" onClick={() => setSelectedLogForDetail(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL 3: ELIMINAR REGISTRO INDIVIDUAL */}
      <Modal show={!!logToDelete} onHide={() => setLogToDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-danger">⚠️ ¿Eliminar este registro?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <p className="mb-0 text-dark fs-6">
            Esta acción no se puede deshacer. Se eliminará el registro de log con ID <strong>#{logToDelete?.id}</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center gap-2 border-0 pt-0">
          <Button variant="danger" onClick={handleConfirmDeleteSingle} className="px-4">
            Sí, Eliminar
          </Button>
          <Button variant="secondary" onClick={() => setLogToDelete(null)} className="px-4">
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL 4: ELIMINAR TODOS LOS REGISTROS NO PROTEGIDOS */}
      <Modal show={showDeleteAllModal} onHide={() => setShowDeleteAllModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold text-danger">🚨 ¿Eliminar todos los registros no protegidos?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <p className="mb-0 text-dark fs-6">
            Se eliminarán permanentemente todos los registros de log de la base de datos que <strong>NO estén marcados como protegidos (Guardar)</strong>.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center gap-2 border-0 pt-0">
          <Button variant="danger" onClick={handleConfirmDeleteAll} className="px-4">
            Sí, Eliminar Todos
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteAllModal(false)} className="px-4">
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};
export default SystemLogsPanel