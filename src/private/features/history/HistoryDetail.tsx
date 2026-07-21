import { Accordion, Badge, Button } from 'react-bootstrap';
import { IHistoryEntry, VisitType } from '../../../shared/types';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import { useWorkspaceStore } from '../patient/workspace/useWorkspaceStore';

interface HistoryDetailProps {
  entry: IHistoryEntry;
  eventKey: string;
}

const getVisitTypeBadge = (type: VisitType) => {
  switch (type) {
    case VisitType.PRESENTIAL: return <Badge bg="primary">Presencial</Badge>;
    case VisitType.VIRTUAL: return <Badge bg="info">Virtual</Badge>;
    case VisitType.PHONE: return <Badge bg="warning" text="dark">Telefónica</Badge>;
    case VisitType.REPORT: return <Badge bg="secondary">Reporte</Badge>;
    default: return null;
  }
};

const HistoryDetail = ({ entry, eventKey }: HistoryDetailProps) => {
  const { loadEntryForEdit } = useHistoryEntryStore();
  
  const formattedDate = new Date(entry.visitDate).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadEntryForEdit(entry.patientId, entry);
    useWorkspaceStore.getState().setActiveSection(entry.patientId, 'new-entry');
  };

  return (
    <Accordion.Item eventKey={eventKey}>
      <Accordion.Header>
        <div className="d-flex w-100 justify-content-between align-items-center me-3">
          <div>
            <strong>{formattedDate}</strong> - {entry.reason}
          </div>
          <div className="d-flex align-items-center gap-3">
            {getVisitTypeBadge(entry.visitType)}

          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <div className="mb-4">
            <Button variant="outline-primary" size="sm" onClick={handleEdit}>
              ✏️ Editar
            </Button>
         <hr className="text-secondary border-bottom pb-2"></hr>
          <h6 className="text-secondary border-bottom pb-2">Evolución</h6>
          {entry.evolution ? (
            <div 
              className="evolution-content" 
              dangerouslySetInnerHTML={{ __html: entry.evolution }} 
            />
          ) : (
            <p className="text-muted fst-italic mb-0">Sin evolución registrada.</p>
          )}
        </div>

        {entry.diagnosisSummary && (
          <div className="mb-4">
            <h6 className="text-secondary border-bottom pb-2">Resumen de Diagnóstico</h6>
            <div dangerouslySetInnerHTML={{ __html: entry.diagnosisSummary }} />
          </div>
        )}

        {entry.observations && (
          <div className="mb-4">
            <h6 className="text-secondary border-bottom pb-2">Observaciones</h6>
            <div dangerouslySetInnerHTML={{ __html: entry.observations }} />
          </div>
        )}

        {entry.treatmentPlan && (
          <div className="mb-4">
            <h6 className="text-secondary border-bottom pb-2">Plan de Tratamiento</h6>
            <div dangerouslySetInnerHTML={{ __html: entry.treatmentPlan }} />
          </div>
        )}

        {entry.recommendations && (
          <div className="mb-4">
            <h6 className="text-secondary border-bottom pb-2">Recomendaciones</h6>
            <div dangerouslySetInnerHTML={{ __html: entry.recommendations }} />
          </div>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default HistoryDetail;
