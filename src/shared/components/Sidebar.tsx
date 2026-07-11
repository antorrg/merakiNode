import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';

function Sidebar() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
    {!show?
      <Button
        variant="outline-secondary"
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
        <Offcanvas.Body>
          <Form className="d-flex mb-3">
            <Form.Control
              type="search"
              placeholder="Buscar"
              className="me-2"
              aria-label="Buscar"
            />
            <Button variant="outline-success">Ir</Button>
          </Form>

          <Nav className="flex-column gap-2">
            <Nav.Link as={Link} to="/dashboard" onClick={handleClose}>Inicio</Nav.Link>
            <Nav.Link as={Link} to="/dashboard/patients" onClick={handleClose}>Pacientes</Nav.Link>
            <Nav.Link as={Link} to="/dashboard/history" onClick={handleClose}>Historia</Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
}
         <Outlet/>
          </>
  );
}

export default Sidebar;
