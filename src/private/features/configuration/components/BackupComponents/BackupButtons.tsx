import { Button, Spinner} from 'react-bootstrap'

type ButtonsProps = {
    handleClickBackup: ()=> void
    isPerformingBackup: boolean
    handleClickMaintenance: ()=>void
    isPerformingMaintenance: boolean
    isLoading: boolean
}

const BackupButtons = ({
    handleClickBackup, 
    isPerformingBackup, 
    handleClickMaintenance, 
    isPerformingMaintenance, 
    isLoading
}:ButtonsProps) => {
  return (
          <div className="d-flex flex-wrap gap-3">
              <Button
                variant="outline-primary"
                onClick={handleClickBackup}
                disabled={isPerformingBackup || isLoading}
                className="d-flex align-items-center gap-2 fw-semibold shadow-sm"
              >
                {isPerformingBackup ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Generando Copia...
                  </>
                ) : (
                  <>💾 Crear Copia de Seguridad Ahora</>
                )}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={handleClickMaintenance}
                disabled={isPerformingMaintenance || isLoading}
                className="d-flex align-items-center gap-2 fw-semibold shadow-sm"
              >
                {isPerformingMaintenance ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Ejecutando Mantenimiento...
                  </>
                ) : (
                  <>🧹 Purgar Logs Viejos y Optimizar DB</>
                )}
              </Button>
            </div>
  )
}

export default BackupButtons
