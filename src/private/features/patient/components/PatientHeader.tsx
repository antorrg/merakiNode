import { type IPatient } from "../../../../types"

type Patient = Pick<IPatient, 'firstName'| 'lastName'|'typeDoc'| 'identityCode'| 'age'| 'city'>
type PatientHeaderProps = {
  info: Patient
}

const PatientHeader = ({info}:PatientHeaderProps) => {
 
  return (
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border border-light">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
            {info.firstName!.charAt(0)}{info.lastName!.charAt(0)}
          </div>
          <div>
            <h4 className="m-0 fw-bold text-dark">{info.firstName} {info.lastName}</h4>
            <div className="d-flex gap-3 text-muted mt-1" style={{ fontSize: '0.85rem' }}>
              <span><strong>{info.typeDoc}:</strong> {info.identityCode}</span>
              <span><strong>Edad:</strong> {info.age} años</span>
              {info.city && <span><strong>Ciudad:</strong> {info.city}</span>}
            </div>
          </div>
        </div>
      </div>
  )
}

export default PatientHeader
