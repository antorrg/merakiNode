import {Table } from 'react-bootstrap'
import type { IPatient } from '../../../../types'

type PatientViewerProps = {
    patientDetail: IPatient,

}

const PatientViewer = ({patientDetail}:PatientViewerProps) => {

  const guardiansList = patientDetail?.guardians || [];
  const hasGuardians = guardiansList.length > 0;
  return (
 <Table striped className="align-start mb-0">
              <tbody>
                <tr>
                  <td>
                    <strong>Nombre: </strong>
                    {patientDetail?.firstName}
                  </td>
                  <td>
                    <strong>Apellido: </strong>
                    {patientDetail?.lastName}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Tipo documento: </strong>
                    {patientDetail?.typeDoc}
                  </td>
                  <td>
                    <strong>Número documento: </strong>
                    {patientDetail?.identityCode}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Fecha de nacimiento: </strong>
                    {patientDetail?.birthDate}
                  </td>
                  <td>
                    <strong>Edad: </strong>
                    {patientDetail?.age}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Dirección: </strong>
                    {patientDetail?.address}
                  </td>
                  <td>
                    <strong>Ciudad: </strong>
                    {patientDetail?.city}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Teléfono: </strong>
                    {patientDetail?.phone || 'No registra'}
                  </td>
                  <td>
                    <strong>Correo Electrónico: </strong>
                    {patientDetail?.email || 'No registra'}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <strong>Responsable o tutor: </strong>
                    {hasGuardians ? `${guardiansList.length} registrado(s)` : 'No posee'}
                  </td>
                </tr>
              </tbody>
            </Table>
  )
}

export default PatientViewer
