import { Accordion, Badge, Button, Form } from 'react-bootstrap';
import { IHistoryEntry, VisitType } from '../../../types';
import { useHistoryEntryStore } from './useHistoryEntryStore';
import { useWorkspaceStore } from '../workspace/useWorkspaceStore';
import { useHistoryPdfStore } from '../pdfExport/useHistoryPdfStore';
import { useDiagnosisStore } from '../diagnostic/useDiagnosisStore';

interface HistoryDetailProps {
  entry: IHistoryEntry;
  eventKey: string;
  showCheck: boolean;
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

const translateDiagnosisStatus = (status: string): string => {
  switch (status) {
    case 'ACTIVE': return 'ACTIVO';
    case 'CHRONIC': return 'CRÓNICO';
    case 'RESOLVED': return 'RESUELTO';
    case 'SUSPENDED': return 'SUSPENDIDO';
    default: return status || 'ACTIVO';
  }
};

const HistoryDetail = ({ entry, eventKey, showCheck= false }: HistoryDetailProps) => {
  const { loadEntryForEdit } = useHistoryEntryStore();
  const { selectedEntryIds, toggleSelectEntry } = useHistoryPdfStore();
  const { activeDiagnosesByPatient } = useDiagnosisStore();

  const isSelected = !!selectedEntryIds[entry.entryId];
  const activeDiagnoses = activeDiagnosesByPatient[entry.patientId] || [];
  const linkedDiagnoses = activeDiagnoses.filter((d) => entry.diagnosisIds?.includes(d.diagnosisId));

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
          <div className="d-flex align-items-center gap-2">
            {showCheck === true?
            <Form.Check
              type="checkbox"
              id={`select-entry-${entry.entryId}`}
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                toggleSelectEntry(entry.entryId);
              }}
              onClick={(e) => e.stopPropagation()}
              title="Seleccionar para exportación PDF"
            />
            :null}
            <span>
              <strong>{formattedDate}</strong> - {entry.reason}
            </span>
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

        {(entry.diagnosisSummary || linkedDiagnoses.length > 0) && (
          <div className="mb-4">
            <h6 className="text-secondary border-bottom pb-2">Diagnóstico / Diagnósticos Asociados</h6>
            {linkedDiagnoses.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                {linkedDiagnoses.map((d) => (
                  <Badge key={d.diagnosisId} bg="info" className="py-1 px-2">
                    🏷️ {d.title} ({translateDiagnosisStatus(d.status)})
                  </Badge>
                ))}
              </div>
            )}
            {entry.diagnosisSummary && (
              <div dangerouslySetInnerHTML={{ __html: entry.diagnosisSummary }} />
            )}
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
