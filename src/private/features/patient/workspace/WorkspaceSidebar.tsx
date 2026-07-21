import React from 'react';
import { Nav } from 'react-bootstrap';
import { WorkspaceSection } from './useWorkspaceStore';

interface SidebarProps {
  activeSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
}

const WorkspaceSidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const menuItems: { id: WorkspaceSection; label: string; icon: string }[] = [
    { id: 'new-entry', label: 'Nueva Entrada', icon: '📝' },
    { id: 'history', label: 'Entradas Anteriores', icon: '🕰️' },
    { id: 'treatments', label: 'Tratamientos', icon: '💊' },
    { id: 'diagnostic', label: 'Diagnóstico', icon: '🩺' },
    { id: 'patient', label: 'Detalle paciente', icon: '👤' },
  ];

  return (
    <div className="h-100 py-3 d-flex flex-column" style={{ minHeight: '100%' }}>
      <h6 className="px-3 mb-2 text-muted" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Menú Paciente</h6>
      <Nav className="flex-column gap-1 px-2">
        {menuItems.map(item => (
          <Nav.Link 
            key={item.id}
            active={activeSection === item.id}
            onClick={() => onSelectSection(item.id)}
            className={`d-flex align-items-center gap-2 px-3 py-1 transition-colors ${activeSection === item.id ? 'bg-light text-primary fw-semibold' : 'text-secondary hover-bg-light'}`}
            style={{ transition: 'all 0.15s ease-in-out', borderRadius: '4px', fontSize: '0.85rem' }}
          >
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default WorkspaceSidebar;
