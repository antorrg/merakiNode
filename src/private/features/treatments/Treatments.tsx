

interface TreatmentsProps { patientId: string; }
const Treatments: React.FC<TreatmentsProps> = ({ patientId }) => {
        return (
          <div className="bg-white p-4 rounded shadow-sm border border-light">
            <h4 className="mb-4 text-primary">Tratamientos</h4>
            <div className="p-5 text-center text-muted bg-light rounded border">
              <h5 className="text-secondary">Planes de Tratamiento</h5>
              <p>Gestión de medicamentos, sesiones, y seguimiento.</p>
            </div>
          </div>
        );
}

export default Treatments
