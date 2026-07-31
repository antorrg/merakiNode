import Button from 'react-bootstrap/Button';

const TreatmentViewNotAuthorized = () => {
  return (
    <div 
      className="p-5 text-center text-muted bg-light rounded border border-dashed" 
      style={{ borderStyle: 'dashed' }}
    >
      <h6 className="text-secondary mb-2">Sin visibilidad de tratamientos</h6>
      <p className="small mb-3">Usted no cuenta con autorización para acceder a esta sección.</p>
      <Button variant="outline-primary" size="sm" disabled={true}>
        + Asignar Tratamiento
      </Button>
    </div>
  );
}

export default TreatmentViewNotAuthorized
