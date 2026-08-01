import { useEffect, useState } from 'react';
import { usePatientStore } from './usePatientStore';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import Spinner from 'react-bootstrap/Spinner';
import PatientForms from './PatientForms';
import ConfirmModal from '../../../shared/components/modalComponents/ConfirmModal';
import { PatientActionType, patientModalConfigs } from './patientModalConfigs';
import PatientGuardians from './components/PatientGuardians';
import PatientViewer from './components/PatientViewer';

interface PatientProps {
  patientId: string;
}

const Patient = ({ patientId }: PatientProps) => {
  const { patientDetail, isLoading, getPatientById, updatePatientContact } = usePatientStore();
  const { updateOpenPatient } = useWorkspaceStore();

  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null); //eslint-disable-line

  useEffect(() => {
    getPatientById(patientId);
  }, [patientId, getPatientById]);

  const handleEdit = () => {
    setShowFormModal(true);
  };

  const handleRequestConfirm = (_action: PatientActionType, data: unknown) => {
    setPendingPayload(data);
    setShowFormModal(false);
    setShowConfirmAlert(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmAlert(false);
    if (pendingPayload) {
      try {
        await updatePatientContact(patientId, pendingPayload);
        const updated = await getPatientById(patientId);
        if (updated) {
          updateOpenPatient(updated);
        }
      } catch (error) {
        console.error('Error al actualizar paciente:', error);
      } finally {
        setPendingPayload(null);
      }
    }
  };

  const guardiansList = patientDetail?.guardians || [];
  const hasGuardians = guardiansList.length > 0;

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-primary mb-0">Detalle del paciente</h4>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleEdit}
        >
          ✏️ Editar
        </button>
      </div>

      <div className="p-3 text-muted bg-light rounded border">
        {isLoading && !patientDetail ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <PatientViewer patientDetail={patientDetail!} />
            {hasGuardians && (
              <PatientGuardians guardiansList={guardiansList} />
            )}
          </>
        )}
      </div>

      <PatientForms
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        mode="UPDATE"
        selectedPatientId={patientId}
        onRequestConfirm={handleRequestConfirm}
      />

      <ConfirmModal
        isOpen={showConfirmAlert}
        onCancel={() => setShowConfirmAlert(false)}
        onConfirm={handleConfirmAction}
        title={patientModalConfigs.UPDATE.title}
        message={patientModalConfigs.UPDATE.message}
        confirmText={patientModalConfigs.UPDATE.confirmText}
        cancelText={patientModalConfigs.UPDATE.cancelText}
      />
    </div>
  );
};

export default Patient;