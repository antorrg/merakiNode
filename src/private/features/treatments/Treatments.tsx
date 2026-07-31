import React, { useEffect, useState } from 'react';
import { useTreatmentStore } from './useTreatmentStore';
import { ITreatment, IHistoryEntry } from '../../../types';
import { adminApi } from '../../../shared/api/api';
import Spinner from 'react-bootstrap/Spinner';
import ConfirmModal from '../../../shared/components/modalComponents/ConfirmModal';

import EmptyTreatment from './components/EmptyTreatment';
import TreatmentTable from './components/TreatmentTable';
import TreatmentDetailModal from './components/TreatmentDetailModal';
import TreatmentCreateModal, { TreatmentCreateData } from './components/TreatmentCreateModal';
import TreatmentEditModal, { TreatmentEditData } from './components/TreatmentEditModal';
import TreatmentHeader from './components/TreatmentHeader';
import { useAuth } from '../../../context/AuthContext';
import { Role } from '../../../types';
import { hasRole } from '../../../shared/utils/hasRole';
import TreatmentViewNotAuthorized from './components/TreatmentViewNotAuthorized';

interface TreatmentsProps {
  patientId: string;
}

const Treatments: React.FC<TreatmentsProps> = ({ patientId }) => {
  const {user} = useAuth()
  const { 
    treatmentsByPatient, 
    isLoading, 
    fetchTreatmentsByPatient, 
    createTreatment, 
    updateTreatment, 
    deleteTreatment 
  } = useTreatmentStore();

  const treatments = treatmentsByPatient[patientId] || [];

  const [historyEntries, setHistoryEntries] = useState<IHistoryEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedTreatment, setSelectedTreatment] = useState<ITreatment | null>(null);

  
  const loadHistoryEntries = async () => {
    setLoadingEntries(true);
    try {
      const response = await adminApi.execute<IHistoryEntry[]>({
        request: { channel: 'entry:getByPatient', payload: { patientId } },
        reject: () => { /* fallback gracefully */ }
      });
      if (response && Array.isArray(response)) {
        setHistoryEntries(response);
      }
    } catch (e) {
      console.error('Error al cargar entradas de historia médica:', e);
    } finally {
      setLoadingEntries(false);
    }
  };
  useEffect(() => {
    if (patientId) {
      fetchTreatmentsByPatient(patientId);
      loadHistoryEntries();
    }
  }, [patientId, fetchTreatmentsByPatient]);
  
  const handleOpenView = (t: ITreatment) => {
    setSelectedTreatment(t);
    setShowViewModal(true);
  };

  const handleOpenEdit = (t: ITreatment) => {
    setSelectedTreatment(t);
    setShowEditModal(true);
  };

  const handleOpenDelete = (t: ITreatment) => {
    setSelectedTreatment(t);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (data: TreatmentCreateData) => {
    await createTreatment(patientId, data);
    setShowCreateModal(false);
  };

  const handleEditSubmit = async (treatmentId: string, data: TreatmentEditData) => {
    await updateTreatment(patientId, {
      treatmentId,
      ...data
    });
    setShowEditModal(false);
    setSelectedTreatment(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedTreatment) {
      await deleteTreatment(patientId, selectedTreatment.treatmentId);
      setShowDeleteModal(false);
      setSelectedTreatment(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">

      <TreatmentHeader
       run={()=> setShowCreateModal(true)}
       authorized={hasRole(user?.role, Role.PROFESIONAL)}
       />

      {(hasRole(user?.role, Role.PROFESIONAL)===false)?
      <TreatmentViewNotAuthorized/>
      :isLoading && treatments.length === 0 ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : treatments.length === 0 ? (
        <EmptyTreatment openCreate={() => setShowCreateModal(true)} />
      ) : (
        <TreatmentTable
          treatments={treatments}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />
      )}

      {/* Modal Ver Detalle */}
      <TreatmentDetailModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        treatment={selectedTreatment}
        onOpenEdit={handleOpenEdit}
      />

      {/* Modal Crear */}
      <TreatmentCreateModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        historyEntries={historyEntries}
        loadingEntries={loadingEntries}
        onSubmit={handleCreateSubmit}
      />

      {/* Modal Editar */}
      <TreatmentEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        treatment={selectedTreatment}
        onSubmit={handleEditSubmit}
      />

      {/* Modal Eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Tratamiento"
        message={`¿Está seguro de que desea eliminar el tratamiento "${selectedTreatment?.name}"?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Treatments;
