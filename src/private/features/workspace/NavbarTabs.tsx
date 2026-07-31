import { Nav } from 'react-bootstrap'
import { OpenPatient } from './useWorkspaceStore'

type NavbarProps = {
    op: OpenPatient,
    activePatientId: string | null,
    setActivePatient: (id: string) => void,
    removePatient: (id: string) => void
}

const NavbarTabs = ({op, activePatientId, setActivePatient, removePatient}:NavbarProps) => {
  return (
              <Nav.Item key={op.patient.patientId}>
                <div 
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-1 ${activePatientId === op.patient.patientId ? 'active bg-light border-bottom-0' : 'text-muted'}`}
                  style={{ 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    border: '1px solid #dee2e6', 
                    borderBottom: activePatientId === op.patient.patientId ? '1px solid #f8f9fa' : '1px solid #dee2e6',
                    marginRight: '2px', 
                    borderTopLeftRadius: '4px', 
                    borderTopRightRadius: '4px',
                    backgroundColor: activePatientId === op.patient.patientId ? '#f8f9fa' : '#ffffff',
                    position: 'relative',
                    top: '1px'
                  }}
                  onClick={() => setActivePatient(op.patient.patientId)}
                >
                  <span className={activePatientId === op.patient.patientId ? 'fw-semibold text-dark' : 'fw-medium'}>{op.shortName}</span>
                  <button 
                    className="btn-close shadow-none ms-2" 
                    style={{ fontSize: '0.45rem', opacity: activePatientId === op.patient.patientId ? 0.7 : 0.4 }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      removePatient(op.patient.patientId);
                    }}
                  />
                </div>
              </Nav.Item>
  )
}

export default NavbarTabs
