import React, { useEffect, useState } from 'react';
import { useDiagnosisStore } from './useDiagnosisStore';
import { IDiagnosis, DiagnosisStatus } from '../../../types';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import ConfirmModal from '../../../shared/components/modalComponents/ConfirmModal';
import RichTextEditor from '../../../shared/components/RichTextEditor/RichTextEditor';
import { useAuth } from '../../../context/AuthContext';
import { hasRole } from '../../../shared/utils/hasRole';
import { Role } from '../../../types';

interface DiagnosticsProps {
  patientId: string;
}

const lineClampStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxHeight: '3em'
};

const getStatusBadge = (status: DiagnosisStatus) => {
  switch (status) {
    case DiagnosisStatus.ACTIVE:
      return <Badge bg="success">ACTIVO</Badge>;
    case DiagnosisStatus.CHRONIC:
      return <Badge bg="warning" text="dark">CRÓNICO</Badge>;
    case DiagnosisStatus.RESOLVED:
      return <Badge bg="info">RESUELTO</Badge>;
    case DiagnosisStatus.SUSPENDED:
      return <Badge bg="secondary">SUSPENDIDO</Badge>;
    default:
      return <Badge bg="light" text="dark">{status}</Badge>;
  }
};

const Diagnostics: React.FC<DiagnosticsProps> = ({ patientId }) => {
  const { user }=useAuth()
 // const authorized = hasRole(user.role)
 console.log('hasRole: ',hasRole(user?.role, Role.ADMIN))
  const { 
    activeDiagnosesByPatient, 
    isLoading, 
    fetchActiveDiagnoses, 
    createDiagnosis, 
    updateDiagnosis, 
    deleteDiagnosis 
  } = useDiagnosisStore();

  const diagnoses = activeDiagnosesByPatient[patientId] || [];

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedDiag, setSelectedDiag] = useState<IDiagnosis | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    status: DiagnosisStatus.ACTIVE
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: DiagnosisStatus.ACTIVE
  });

  useEffect(() => {
    if (patientId) {
      fetchActiveDiagnoses(patientId);
    }
  }, [patientId, fetchActiveDiagnoses]);

  const handleOpenView = (diag: IDiagnosis) => {
    setSelectedDiag(diag);
    setShowViewModal(true);
  };

  const handleOpenCreate = () => {
    setCreateForm({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      status: DiagnosisStatus.ACTIVE
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim()) return;

    await createDiagnosis({
      patientId,
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      startDate: createForm.startDate,
      status: createForm.status
    });

    setShowCreateModal(false);
  };

  const handleOpenEdit = (diag: IDiagnosis) => {
    setSelectedDiag(diag);
    setEditForm({
      title: diag.title || '',
      description: diag.description || '',
      startDate: diag.startDate || '',
      endDate: diag.endDate || '',
      status: diag.status || DiagnosisStatus.ACTIVE
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiag || !editForm.title.trim()) return;

    await updateDiagnosis(patientId, {
      diagnosisId: selectedDiag.diagnosisId,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      startDate: editForm.startDate,
      endDate: editForm.endDate || null,
      status: editForm.status
    });

    setShowEditModal(false);
    setSelectedDiag(null);
  };

  const handleOpenDelete = (diag: IDiagnosis) => {
    setSelectedDiag(diag);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedDiag) {
      await deleteDiagnosis(patientId, selectedDiag.diagnosisId);
      setShowDeleteModal(false);
      setSelectedDiag(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-primary mb-1">Diagnósticos del Paciente</h4>
          <p className="text-muted small mb-0">Gestión y seguimiento de diagnósticos activos, crónicos y resueltos.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} disabled={hasRole(user?.role, Role.ADMIN)===false}>
          + Nuevo Diagnóstico
        </Button>
      </div>

      { hasRole(user?.role, Role.ADMIN)===false ? (
        <div className="p-5 text-center text-muted bg-light rounded border border-dashed" style={{ borderStyle: 'dashed' }}>
          <h6 className="text-secondary mb-2">Sin visibilidad de diagnósticos</h6>
          <p className="small mb-3">Usted no cuenta con autorización para acceder a esta sección.</p>
        </div>
      ) :isLoading && diagnoses.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : diagnoses.length === 0 || hasRole(user?.role, Role.ADMIN) ? (
        <div className="p-5 text-center text-muted bg-light rounded border border-dashed" style={{ borderStyle: 'dashed' }}>
          <h6 className="text-secondary mb-2">No hay diagnósticos registrados</h6>
          <p className="small mb-3">Haga clic en el botón superior para registrar el primer diagnóstico del paciente.</p>
          <Button variant="outline-primary" size="sm" onClick={handleOpenCreate}>
            + Registrar Diagnóstico
          </Button>
        </div>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Título</th>
              <th style={{ width: '40%' }}>Descripción / Notas</th>
              <th>Estado</th>
              <th>Fecha Inicio</th>
              <th>Fecha Cierre</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((diag) => (
              <tr key={diag.diagnosisId}>
                <td>
                  <Button 
                    variant="link" 
                    className="p-0 text-primary fw-bold text-decoration-none text-start"
                    onClick={() => handleOpenView(diag)}
                    title="Haga clic para ver el detalle completo"
                  >
                    {diag.title} 🔍
                  </Button>
                </td>
                <td className="small">
                  {diag.description ? (
                    <div>
                      <div 
                        style={lineClampStyle}
                        dangerouslySetInnerHTML={{ __html: diag.description }} 
                      />
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none small text-muted mt-1" 
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => handleOpenView(diag)}
                      >
                        👁️ Ver detalle completo
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted">Sin descripción</span>
                  )}
                </td>
                <td>{getStatusBadge(diag.status)}</td>
                <td className="small">{diag.startDate}</td>
                <td className="small">{diag.endDate || '-'}</td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenView(diag)} title="Ver detalle">
                      👁️
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleOpenEdit(diag)} title="Editar">
                      ✏️
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleOpenDelete(diag)} title="Eliminar">
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Ver Detalle del Diagnóstico */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-5 text-primary">
            🩺 {selectedDiag?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row mb-3 bg-light p-3 rounded border mx-0">
            <div className="col-md-4 mb-2">
              <strong className="text-secondary small d-block">Estado:</strong>
              <span>{selectedDiag ? getStatusBadge(selectedDiag.status) : '-'}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong className="text-secondary small d-block">Fecha de Inicio:</strong>
              <span>{selectedDiag?.startDate}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong className="text-secondary small d-block">Fecha de Cierre:</strong>
              <span>{selectedDiag?.endDate || '-'}</span>
            </div>
          </div>

          <h6 className="fw-bold text-secondary mb-2">Descripción y Observaciones Clínicas:</h6>
          <div className="p-3 border rounded bg-white shadow-sm" style={{ minHeight: '120px' }}>
            {selectedDiag?.description ? (
              <div dangerouslySetInnerHTML={{ __html: selectedDiag.description }} />
            ) : (
              <p className="text-muted small mb-0 italic">Sin descripción o notas adicionales.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => { setShowViewModal(false); if (selectedDiag) handleOpenEdit(selectedDiag); }}>
            ✏️ Editar este Diagnóstico
          </Button>
          <Button variant="primary" onClick={() => setShowViewModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Crear Diagnóstico */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 text-primary">Registrar Diagnóstico</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título / Diagnóstico</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ej. Hipertensión Arterial, Trastorno de Ansiedad..."
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción / Observaciones (Editor Tiptap)</Form.Label>
              <RichTextEditor
                content={createForm.description}
                onChange={(html) => setCreateForm({ ...createForm, description: html })}
                placeholder="Detalles sobre síntomas, antecedentes o notas asociadas..."
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select 
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as DiagnosisStatus })}
                  >
                    <option value={DiagnosisStatus.ACTIVE}>ACTIVO</option>
                    <option value={DiagnosisStatus.CHRONIC}>CRÓNICO</option>
                    <option value={DiagnosisStatus.RESOLVED}>RESUELTO</option>
                    <option value={DiagnosisStatus.SUSPENDED}>SUSPENDIDO</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Diagnóstico</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Editar Diagnóstico */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 text-primary">Editar Diagnóstico</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título / Diagnóstico</Form.Label>
              <Form.Control 
                type="text" 
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción / Observaciones (Editor Tiptap)</Form.Label>
              <RichTextEditor
                content={editForm.description}
                onChange={(html) => setEditForm({ ...editForm, description: html })}
                placeholder="Detalles sobre síntomas, antecedentes o notas asociadas..."
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select 
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as DiagnosisStatus })}
                  >
                    <option value={DiagnosisStatus.ACTIVE}>ACTIVO</option>
                    <option value={DiagnosisStatus.CHRONIC}>CRÓNICO</option>
                    <option value={DiagnosisStatus.RESOLVED}>RESUELTO</option>
                    <option value={DiagnosisStatus.SUSPENDED}>SUSPENDIDO</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {(editForm.status === DiagnosisStatus.RESOLVED || editForm.status === DiagnosisStatus.SUSPENDED) && (
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Cierre / Resolución</Form.Label>
                <Form.Control 
                  type="date" 
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                />
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Actualizar Diagnóstico</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Diagnóstico"
        message={`¿Está seguro de que desea eliminar el diagnóstico "${selectedDiag?.title}"?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Diagnostics;
