import { useNavigate } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';

const EmptyPatient = () => {
    const navigate = useNavigate()

    return (
      <Container className="mt-5 text-center">
        <h4 className="fw-medium text-secondary mb-3" style={{ letterSpacing: '-0.5px' }}>Espacio de Trabajo</h4>
        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>No hay pacientes abiertos. Selecciona uno desde la lista.</p>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/dashboard/patients')} className="px-4">
          Ir a Lista de Pacientes
        </Button>
      </Container>
    ); 
}

export default EmptyPatient
