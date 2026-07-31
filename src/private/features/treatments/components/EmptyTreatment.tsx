import Button from 'react-bootstrap/Button';

export interface EmptyTreatmentProps {
  openCreate: () => void;
}

const EmptyTreatment = ({ openCreate }:EmptyTreatmentProps) => {
  return (
    <div 
      className="p-5 text-center text-muted bg-light rounded border border-dashed" 
      style={{ borderStyle: 'dashed' }}
    >
      <h6 className="text-secondary mb-2">No hay tratamientos asignados</h6>
      <p className="small mb-3">Registre el primer plan de tratamiento o rutina de praxias para el paciente.</p>
      <Button variant="outline-primary" size="sm" onClick={openCreate}>
        + Asignar Tratamiento
      </Button>
    </div>
  );
};

export default EmptyTreatment;
