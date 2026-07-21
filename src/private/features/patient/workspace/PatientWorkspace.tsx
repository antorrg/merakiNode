import { useNavigate } from 'react-router-dom';
import { Nav, Button, Row, Col } from 'react-bootstrap';
import { useWorkspaceStore } from './useWorkspaceStore';
import WorkspaceSidebar from './WorkspaceSidebar';
import WorkspaceContent from './WorkspaceContent';
import EmptyPatient from './components/EmptyPatient';
import NavbarTabs from './components/NavbarTabs';

const PatientWorkspace = () => {
  const navigate = useNavigate();
  const { openPatients, activePatientId, setActivePatient, removePatient } = useWorkspaceStore();

  if (openPatients.length === 0) {
    return (
      <EmptyPatient/>
    )
  }

  const activePatient = openPatients.find(p => p.patient.patientId === activePatientId);

  return (
    <div className="d-flex flex-column bg-light flex-grow-1 h-100 overflow-hidden">
      {/* Top Tabs Bar */}
      <div className="bg-white pt-3 px-4 border-bottom shadow-sm z-1">
        <div className="d-flex align-items-end justify-content-between">
          <Nav variant="tabs" className="border-0">
            {openPatients.map(op => (
              <NavbarTabs 
              key={op.patient.patientId}
              op={op} 
              activePatientId={activePatientId} 
              setActivePatient={setActivePatient} 
              removePatient={removePatient}
              />
            ))}
          </Nav>
          <Button variant="outline-primary" size="sm" className="mb-2 d-flex align-items-center gap-2" onClick={() => navigate('/dashboard/patients')}>
            <span>←</span> Lista de Pacientes
          </Button>
        </div>
      </div>

      {/* Main Workspace Area */}
      {activePatient && (
        <Row className="flex-grow-1 m-0 overflow-hidden">
          {/* Sidebar */}
          <Col xs={2} className="bg-white border-end p-0 shadow-sm z-0">
            <WorkspaceSidebar 
              activeSection={activePatient.activeSection} 
              onSelectSection={(section) => useWorkspaceStore.getState().setActiveSection(activePatient.patient.patientId, section)} 
            />
          </Col>
          
          {/* Content Area */}
          <Col xs={10} className="p-4 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
            <WorkspaceContent 
            patient={activePatient.patient} 
            activeSection={activePatient.activeSection} 
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PatientWorkspace;
