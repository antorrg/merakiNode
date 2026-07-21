import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import { usePatientStore } from './usePatientStore';
import ConfirmModal from '../../../shared/components/modalComponents/ConfirmModal';
import PatientForms from './PatientForms';
import { PatientActionType, patientModalConfigs } from './patientModalConfigs';
import { useWorkspaceStore } from './workspace/useWorkspaceStore';

const Patients = () => {
  const navigate = useNavigate();
  const { addPatient } = useWorkspaceStore();
  const { patients, info, isLoading, fetchPatients, deletePatient, createPatient, updatePatientContact, getPatientById } = usePatientStore();
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<PatientActionType>('CREATE'); // CREATE o UPDATE
  const [pendingAction, setPendingAction] = useState<{ type: PatientActionType | null, payload?: any }>({ type: null });
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchPatients(currentPage, limit);
  }, [fetchPatients, currentPage]);

  const handleCreate = () => {
    setFormMode('CREATE');
    setSelectedPatientId(undefined);
    setShowFormModal(true);
  };

  const handleEdit = (id: string) => {
    setFormMode('UPDATE');
    setSelectedPatientId(id);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    setPendingAction({ type: 'DELETE', payload: { patientId: id } });
    setShowConfirmAlert(true);
  };

  const handleRequestConfirm = (action: PatientActionType, data: any) => {
    setPendingAction({ type: action, payload: data });
    setShowFormModal(false); // Escondemos el form para mostrar el confirm
    setShowConfirmAlert(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmAlert(false);
    
    if (pendingAction.type === 'DELETE' && pendingAction.payload?.patientId) {
      await deletePatient(pendingAction.payload.patientId);
    } else if (pendingAction.type === 'CREATE' && pendingAction.payload) {
      await createPatient(pendingAction.payload);
    } else if (pendingAction.type === 'UPDATE' && pendingAction.payload) {
      await updatePatientContact(pendingAction.payload.patientId, pendingAction.payload);
    }
    
    setPendingAction({ type: null });
  };

  const handleNextPage = () => {
    if (info && currentPage < info.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Gestión de Pacientes</h2>
        <Button variant="primary" onClick={handleCreate} className="shadow-sm">
          + Nuevo Paciente
        </Button>
      </div>

      {isLoading && patients.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="table-responsive shadow-sm bg-white">
          <Table striped hover className="align-middle mb-0">
            <thead className="table-warning">
              <tr>
                <th>Nombre Completo</th>
                <th>Documento</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.patientId}>
                    <td className="fw-medium">
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none fw-medium" 
                        onClick={async () => {
                          try {
                            const fullPatient = await getPatientById(patient.patientId);
                            if (fullPatient) {
                              addPatient(fullPatient);
                              navigate('/dashboard/patient-workspace');
                            }
                          } catch (error) {
                            console.error('Error fetching patient details:', error);
                          }
                        }}
                      >
                        {patient.firstName} {patient.lastName}
                      </Button>
                    </td>
                    <td>{patient.typeDoc}: {patient.identityCode}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(patient.patientId)}>
                          Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(patient.patientId)}>
                          Borrar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-muted">
                    No hay pacientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          
          {info && info.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
              <span className="text-muted">
                Página {info.page} de {info.totalPages} (Total: {info.totalItems})
              </span>
              <div>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  className="me-2" 
                  disabled={info.page <= 1}
                  onClick={handlePrevPage}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  disabled={info.page >= info.totalPages}
                  onClick={handleNextPage}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <PatientForms 
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        mode={formMode}
        selectedPatientId={selectedPatientId}
        onRequestConfirm={handleRequestConfirm}
      />

      <ConfirmModal
        isOpen={showConfirmAlert}
        onCancel={() => setShowConfirmAlert(false)}
        onConfirm={handleConfirmAction}
        title={pendingAction.type ? patientModalConfigs[pendingAction.type].title : ''}
        message={pendingAction.type ? patientModalConfigs[pendingAction.type].message : ''}
        confirmText={pendingAction.type ? patientModalConfigs[pendingAction.type].confirmText : ''}
        cancelText={pendingAction.type ? patientModalConfigs[pendingAction.type].cancelText : ''}
      />
    </div>
  );
};

export default Patients;