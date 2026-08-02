import { useEffect, useState } from 'react';
import { Accordion, Spinner, Alert, Form, Button, CloseButton } from 'react-bootstrap';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import HistoryDetail from './HistoryDetail';
import { useAuth } from '../../../context/AuthContext';
import { Role } from '../../../types';
import { hasRole } from '../../../shared/utils/hasRole';
import HistoryNotAuthorized from './HistoryNotAuthorized';
import { useHistoryPdfStore } from '../pdfExport/useHistoryPdfStore';
import { HistoryPdfExportModal } from '../pdfExport/HistoryPdfExportModal';
import { usePatientStore } from '../patient/usePatientStore';
import { useDiagnosisStore } from '../diagnostic/useDiagnosisStore';

interface HistoriesProps {
  patientId: string;
}

const Histories = ({ patientId }: HistoriesProps) => {
  const { user } = useAuth();
  const [ showCheck, setShowCheck ] = useState(false)
  const { entriesByPatient, fetchEntriesByPatient, isLoading, error } = useHistoryEntryStore();
  const { patientDetail, getPatientById } = usePatientStore();
  const { activeDiagnosesByPatient, fetchActiveDiagnoses } = useDiagnosisStore();
  
  const {
    selectAllEntries,
    deselectAllEntries,
    isAllSelected,
    getSelectedCount,
    openExportModal,
  } = useHistoryPdfStore();

  const entries = entriesByPatient[patientId] || [];
  const activeDiagnoses = activeDiagnosesByPatient[patientId] || [];
  const selectedCount = getSelectedCount();
  const allSelected = isAllSelected(entries);

  useEffect(() => {
    fetchEntriesByPatient(patientId);
    fetchActiveDiagnoses(patientId);
    if (!patientDetail || patientDetail.patientId !== patientId) {
      getPatientById(patientId).catch(() => {});
    }
  }, [patientId, fetchEntriesByPatient, fetchActiveDiagnoses, getPatientById, patientDetail]);

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      selectAllEntries(entries);
    } else {
      deselectAllEntries();
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="text-primary mb-0">Historial Clínico</h4>

        {hasRole(user?.role, Role.PROFESIONAL) && entries.length > 0 && (
          <div className="d-flex align-items-center gap-3">
            {showCheck? 
          <>
            <Form.Check
              type="checkbox"
              id="select-all-entries"
              label={`Seleccionar todas (${entries.length})`}
              checked={allSelected}
              onChange={handleSelectAllChange}
              className="fw-semibold text-secondary"
            />

            <Button
              variant={selectedCount > 0 ? 'primary' : 'outline-secondary'}
              size="sm"
              disabled={selectedCount === 0}
              onClick={() => openExportModal(entries, activeDiagnoses)}
              className="d-flex align-items-center gap-1"
            >
              📄 Generar Reporte PDF {selectedCount > 0 ? `(${selectedCount})` : ''}
            </Button>
            <CloseButton onClick={() => setShowCheck(false)}/>
            </>
            :
            <Button
              variant={'primary'}
              size="sm"
              onClick={() => setShowCheck(true)}
              className="d-flex align-items-center gap-1"
            >
              📄  Crear reporte
            </Button>
            }
          </div>
        )}
      </div>

      {!hasRole(user?.role, Role.PROFESIONAL) ? (
        <HistoryNotAuthorized />
      ) : isLoading && entries.length === 0 ? (
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Cargando historial...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : entries.length === 0 ? (
        <div className="p-5 text-center text-muted bg-light rounded border">
          <h5 className="text-secondary">Sin Entradas Previas</h5>
          <p>Este paciente aún no tiene historias clínicas registradas.</p>
        </div>
      ) : (
        <>
          <Accordion>
            {entries.map((entry, index) => (
              <HistoryDetail
                key={entry.entryId}
                entry={entry}
                eventKey={index.toString()}
                showCheck={showCheck}
              />
            ))}
          </Accordion>

          {/* Modal de Previsualización y Edición para Exportación PDF */}
          <HistoryPdfExportModal patient={patientDetail} />
        </>
      )}
    </div>
  );
};

export default Histories;
