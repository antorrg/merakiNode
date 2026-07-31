import { useEffect } from 'react';
import { Accordion, Spinner, Alert } from 'react-bootstrap';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import HistoryDetail from './HistoryDetail';
import { useAuth } from '../../../context/AuthContext';
import { Role } from '../../../types';
import { hasRole } from '../../../shared/utils/hasRole';
import HistoryNotAuthorized from './HistoryNotAuthorized';

interface HistoriesProps {
  patientId: string;
}

const Histories = ({ patientId }: HistoriesProps) => {
  const {user} =useAuth()
  const { entriesByPatient, fetchEntriesByPatient, isLoading, error } = useHistoryEntryStore();
  
  const entries = entriesByPatient[patientId] || [];

  useEffect(() => {
    fetchEntriesByPatient(patientId);
  }, [patientId, fetchEntriesByPatient]);

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-light">
      <h4 className="mb-4 text-primary">Historial Clínico</h4>
      
      {(hasRole(user?.role, Role.PROFESIONAL)===false)?
      <HistoryNotAuthorized/>
      : isLoading && entries.length === 0 ? (
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
        <Accordion>
          {entries.map((entry, index) => (
            <HistoryDetail 
              key={entry.entryId} 
              entry={entry} 
              eventKey={index.toString()} 
            />
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default Histories;
