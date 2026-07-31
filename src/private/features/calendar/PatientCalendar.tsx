
type PatientCalendarProps = {
    patientId:string
}

const PatientCalendar = ({patientId}:PatientCalendarProps) => {
    console.log(patientId)
  return (
   <div className="bg-white p-4 rounded shadow-sm border border-light">
      <h4 className="mb-4 text-primary">Calendario de sesiones</h4>
       <div className="p-5 text-center text-muted bg-light rounded border">
          <h5 className="text-secondary">Sin Entradas Previas</h5>
          <p>Este paciente aún no tiene fechas ni horarios registrados.</p>
        </div>
    </div>
  )
}

export default PatientCalendar
