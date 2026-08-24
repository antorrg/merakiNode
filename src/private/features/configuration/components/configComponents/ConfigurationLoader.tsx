import { Card, Spinner} from 'react-bootstrap'

const ConfigurationLoader = () => {
  return (
        <Card className="border-0 shadow-sm p-5 text-center">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted mb-0">Cargando configuración del sistema...</p>
          </Card.Body>
        </Card>
  )
}

export default ConfigurationLoader
