import { Button } from 'react-bootstrap'

type HeaderProps = {
    run: ()=>void
    authorized?: boolean
}

const TreatmentHeader = ({run, authorized=false}:HeaderProps) => {
  return (
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-primary mb-1">Planes de Tratamiento</h4>
          <p className="text-muted small mb-0">Gestión de praxias, ejercicios terapéuticos y seguimiento.</p>
        </div>
        <Button variant="primary" size="sm" onClick={run} disabled={!authorized}>
          + Nuevo Tratamiento
        </Button>
      </div>
  )
}

export default TreatmentHeader
