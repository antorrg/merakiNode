


interface PatientProps { patientId: string; }


const Patient = ({ patientId }:PatientProps) => {
       console.log(patientId)
         return (
          <div className="bg-white p-4 rounded shadow-sm border border-light">
            <div className='d-flex justify-content-between align-items-center mb-4'>
            <h4 className="text-primary">Detalle del paciente</h4>
            <button className='btn btn-sm btn-outline-secondary' onClick={()=>alert('Simula la Edicion de paciente')}>Editar</button>
            </div>
            <div className="p-5 text-center text-muted bg-light rounded border">
              <p>Aquí se renderizará la información del paciente.</p>
            </div>
          </div>
        );
}

export default Patient
