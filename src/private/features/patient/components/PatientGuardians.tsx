import {Table } from 'react-bootstrap'
import type { Guardian } from '../../../../types'

type PatientGuardianProps = {
    guardiansList: Guardian[]
}
const PatientGuardians = ({guardiansList}: PatientGuardianProps) => {
  return (
              <div className="mt-4 text-start">
                <h5 className="text-primary fs-6 mb-2 fw-bold">Responsables / Tutores</h5>
                <Table striped bordered hover size="sm" className="mb-0 bg-white">
                  <thead>
                    <tr className="table-light">
                      <th>Nombre</th>
                      <th>Relación</th>
                      <th>Teléfono</th>
                      <th>Contacto Principal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guardiansList.map((g, index) => (
                      <tr key={`${g.name}-${index}`}>
                        <td>{g.name}</td>
                        <td>{g.relationship}</td>
                        <td>{g.phone}</td>
                        <td>
                          {g.isPrimary ? (
                            <span className="badge bg-success">Sí, principal</span>
                          ) : (
                            <span className="badge bg-secondary">Secundario</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
  )
}

export default PatientGuardians
