import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import ConfirmModal from './modalComponents/ConfirmModal';
import { hasRole } from '../utils/hasRole';
import { Role } from '../../types'
import ProfileModal from '../../private/features/user/forms/ProfileModal';
import { NavDropdown } from 'react-bootstrap';
import { ErrorBoundary } from './ErrorBoundary';

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [show, setShow] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const onCancelAlert = () => {
    setShow(false)
    setAlert(false)
    return
  }

  return (
    <>
    {!show?
      <Button
        variant="outline-warning"
        className="position-fixed top-0 start-0 m-3 rounded-1 shadow-sm d-flex align-items-center justify-content-center"
        style={{ zIndex: 1100, width: '48px', height: '28px' }}
        onClick={handleShow}
        aria-label="Abrir menú"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="18"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          />
        </svg>
      </Button>
        :
      <Offcanvas show={show} onHide={handleClose} placement="start" className='admin-offcanvas'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Meraki</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <div className="mb-3 px-2 py-2 bg-light rounded text-center shadow-sm">
            <span className="text-muted small">Bienvenido,</span><br/>
            <strong className="text-primary">{user?.userName || 'Usuario'}</strong>
          </div>

          <Nav className="flex-column gap-2">
            <Nav.Link as={Link} to="/dashboard" onClick={handleClose}>Inicio</Nav.Link>
            <Nav.Link as={Link} to="/dashboard/patients" onClick={handleClose}>Pacientes</Nav.Link>
            <Nav.Link as={Link} to="/dashboard/calendar" onClick={handleClose}>Agenda</Nav.Link>
            
          </Nav>
          
          <Nav className="flex-column gap-2 mt-auto mb-0">
                        {/* Ejemplo de enlace oculto según el rol del usuario */}
            {hasRole(user?.role, Role.PROPIETARIO)? (
              <NavDropdown
              title="Administración"
              >
              <NavDropdown.Item as={Link} to="/dashboard/users" onClick={handleClose} className="text-primary">Usuarios</NavDropdown.Item>
               <NavDropdown.Item as={Link} to="/dashboard/admin" onClick={handleClose} className="text-secondary">Historia Clínica</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/dashboard/admin" onClick={handleClose} className="text-success">Configuración</NavDropdown.Item>
              </NavDropdown>
            ):null}
            <Nav.Link as={Link} to="#" onClick={() => { handleClose(); setShowProfileModal(true); }} className="text-primary">Mi Perfil</Nav.Link>
            <Nav.Link as={Link} to="#" onClick={()=>setAlert(true)} className="text-danger">Cerrar sesión</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
}         
          <ConfirmModal
            isOpen={alert} 
            onCancel= {onCancelAlert}
            onConfirm= {()=>logout()}
            title = "Cerrar Sesión" 
            message = " ¿Deseas continuar?"
            confirmText = "Sí, cerrar sesión"
            cancelText = "No, volver"
          />
          <ProfileModal show={showProfileModal} onHide={() => setShowProfileModal(false)} />
          <ErrorBoundary key={location.pathname}>
            <Outlet/>
          </ErrorBoundary>
          </>
  );
}

export default Sidebar;
